const Sequelize = require('sequelize');
const bcryptjs = require("bcryptjs");

const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
})

module.exports = {
    // Gets all 
    getAssets: (req, res) => {
        const {query} = req;
        const queries = Object.keys(query);

        if (queries.length > 0) {
            // TODO: Handle SQL queries with passed through key:pairs.
            if (query['name']) console.log(query.name);
            console.log((+query['owner']) ? 'Owner with number.' : 'Owner with string.');
            res.sendStatus(400);
        }

        else { 
            console.log('No queries');
            sequelize.query(`
            SELECT a.asset_id, a.name, m.name AS manufacturer, md.name AS model
            FROM asset as a
            LEFT OUTER JOIN manufacturer m ON a.manufacturer = m.manufacturer_id
            LEFT OUTER JOIN model md ON a.model = md.model_id;
            `)
            
            .then(dbRes => res.status(200).send(dbRes[0]))
            
        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        })
    }
},
    
    getAssetByID: (req, res) => {
        console.log(req.params.id);
        sequelize.query(`
        SELECT a.asset_id, a.name, m.name AS manufacturer, model
        FROM asset as a
        LEFT OUTER JOIN manufacturer m ON a.manufacturer = m.manufacturer_id
        WHERE a.asset_id = ${req.params.id};
        `)
        
        .then(dbRes => res.status(200).send(dbRes[0]))
        
        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        })
    },

     getManufacturers: (req, res) => {
        sequelize.query('SELECT * FROM manufacturer')
        
        .then(sqlRes => res.status(200).send(sqlRes[0]))
        
        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        });
    },

    getModels: (req, res) => {
        sequelize.query(`
        SELECT * FROM model
        WHERE manufacturer = ${req.params.id};`
        ).then(sqlRes => { res.status(200).send(sqlRes[0]) });
    },

    createAsset: (req, res) => {
        const {assetName, manufacturer, assetID, model_id} = req.body;

        sequelize.query(`
        INSERT INTO asset (name, manufacturer, model, owner, creator, purchase_order)
        VALUES('${assetName}', ${manufacturer}, ${model_id}, NULL, ${1 /* TODO */}, NULL);
        SELECT MAX(asset_id) AS asset_id FROM asset;
        `)
        
        .then(dbRes => {
            console.log(dbRes[0]);
            res.status(200).send(dbRes[0]);
        })
         
        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        })
    },

    updateAsset: (req, res) => {

        const {assetName, manufacturer, assetID, model_id} = req.body;

        sequelize.query(`
            UPDATE asset
            SET name = '${assetName}',
            manufacturer = ${manufacturer},
            model = ${model_id}
            WHERE asset_id = ${assetID}
            RETURNING *;
        `)

        .then(dbRes => {
            res.status(200).send(dbRes[0]);
        })

        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        });
    },

    deleteAsset: (req, res) => {
        const { id } = req.params;
        if(+id) {
        sequelize.query(`
            DELETE FROM asset WHERE asset_id = ${id};
        `)
        
        .then(dbRes => {
            res.status(200).send(`Asset id: ${id} has been deleted.`);
        })

        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        })

        }
        else res.sendStatus(400);
    },

    login: (req, res) => {
        const { username, password } = req.body;

        if(!validateBody(req.body)) {
            res.sendStatus(400);
            return;
        }

        sequelize.query(`
        SELECT username, password, user_id FROM authentication
        WHERE LOWER(username) = LOWER('${username}');
        `)
        
        .then(dbRes => {
            
            try {
                const {username: dbUsername, password: dbPassword, user_id: userID} = dbRes[0][0];

                if(bcryptjs.compareSync(password, dbPassword)) {
                    console.log(`${dbUsername} authenticated.`);
                    res.status(200).send({username, userID});
                }
                else {
                    res.status(400).send('Passwords do not match.')
                }
            }
            catch {
                res.sendStatus(400);
                console.log('Error with login. dbRes may be empty. (Does the username exist in db?');
            }
        })
        
        .catch(err => {
            let error = err.message;
            res.status(400).send(error);
            console.log(error);
        })
      },
  
      register: (req, res) => {
        const { firstName, lastName, email, username, password } = req.body;

        let isAdmin = false; // TODO

        // TODO: Username and length checks.

        if(!validateBody(req.body)) {
            res.sendStatus(400);
            return;
        }

        let hashSalt = bcryptjs.genSaltSync(5);
        let hashPassword = bcryptjs.hashSync(password, hashSalt);

        sequelize.query(`
        WITH new_user AS (
        INSERT INTO users(first_name, last_name)
        VALUES('${firstName}', '${lastName}')
        RETURNING user_id)
            
        INSERT INTO authentication(user_id, email, username, password, is_admin)
        SELECT user_id, '${email}', '${username}', '${hashPassword}', ${isAdmin ? 'True' : 'False'} FROM new_user;
        `)

        .then(dbRes => {
            res.status(200).send('User registered succesfully!')
        })

        .catch(err => {
            let error = err.errors[0].message;
            res.status(400).send(error);
            console.log(error);
        })
      },

    postManufacturer: (req, res) => {

        const {manufacturerName} = req.body;

        sequelize.query(`
        INSERT INTO manufacturer(name)
        VALUES('${manufacturerName}')
        RETURNING manufacturer_id;
        `)

        .then(dbRes => {
            console.log(dbRes[0]);
            res.status(200).send(dbRes[0]);
        })

        .catch(err => {
            console.log(err.message);
            res.status(400).send(err.message);
        })
    },

    putManufacturer: (req, res) => {

        const {manufacturerName} = req.body;

        console.log(req.params.id)

        sequelize.query(`
        UPDATE manufacturer
        SET name = '${manufacturerName}'
        WHERE manufacturer_id = ${req.params.id};
        `)

        .then(dbRes => {
            console.log(dbRes[0]);
            let manufacturer_id = req.params.id;
            res.status(200).send();
        })

        .catch(err => {
            console.log(err.message);
            res.status(400).send(err.message);
        })
    },

    deleteManufacturer: (req, res) => {
        
    }
}

function validateBody(body, bodyType) {
    let pass = true;
    Object.keys(body).forEach(key => {
        let variable = body[key].split(" ").join("");
        if(variable != body[key]) {
            // console.log('Body contains a space in: ' + key);
            pass = false;
        }
        if(body[key] === '') {
            // console.log(`${key} cannot be empty.`);
            pass = false;
        }
    })
    return pass;
}

