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
            `).then(dbRes => res.status(200).send(dbRes[0])).catch(err => res.status(400).send('I am error.'));
    }
},
    
    getAssetByID: (req, res) => {
        console.log(req.params.id);
        sequelize.query(`
        SELECT a.asset_id, a.name, m.name AS manufacturer, md.name AS model
FROM asset as a
  LEFT OUTER JOIN manufacturer m ON a.manufacturer = m.manufacturer_id
  LEFT OUTER JOIN model md ON a.model = md.model_id
  WHERE a.asset_id = ${req.params.id};
        `).then(dbRes => res.status(200).send(dbRes[0])).catch(err => res.status(400).send('I am error.'));
    },

     getManufacturers: (req, res) => {
        sequelize.query('SELECT * FROM manufacturer').then(sqlRes => { res.status(200).send(sqlRes[0]) });
    },

    createAsset: (req, res) => {
        const {assetName, manufacturer, assetID} = req.body;

        sequelize.query(`
        INSERT INTO asset (name, manufacturer, model, owner, creator, purchase_order)
        VALUES('${assetName}', ${(manufacturer) ? manufacturer : 'NULL'}, NULL, NULL, ${1 /* TODO */}, NULL);
        SELECT MAX(asset_id) AS asset_id FROM asset;
        `).then(dbRes => {
            console.log(dbRes[0]);
            res.status(200).send(dbRes[0]);
        }).catch(err => {
            res.sendStatus(400)
            console.log(err);
        })
    },

    updateAsset: (req, res) => {

        const {assetName, manufacturer, assetID} = req.body;

        sequelize.query(`
        UPDATE asset
            SET name = '${assetName}',
            manufacturer = ${(manufacturer === '') ? 'NULL' : manufacturer}
            WHERE asset_id = ${assetID}
            RETURNING *;
`).then(dbRes => {
    res.status(200).send(dbRes[0]);
}).catch(err => {
    res.status(400).send(err);
    console.log(err)
});
    },

    deleteAsset: (req, res) => {
        const { id } = req.params;
        if(+id) {
        sequelize.query(`
        DELETE FROM asset WHERE asset_id = ${id};
        `).then(dbRes => {
            res.status(200).send(`Asset id: ${id} has been deleted.`);
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
        SELECT username, password FROM authentication
        WHERE LOWER(username) = LOWER('${username}');
        `).then(dbRes => {
            
            const {username: dbUsername, password: dbPassword} = dbRes[0][0];

            if(bcryptjs.compareSync(password, dbPassword)) {
                console.log('Passwords match I think?');
                res.sendStatus(200);
            }
            else {
                res.status(400).send('Passwords do not match.')
            }

        }).catch(err => res.sendStatus(400));
        
        // for (let i = 0; i < users.length; i++) {
        //   if (users[i].username === username && bcryptjs.compareSync(password, users[i].password)) {
        //     let userData = {...users[i]}
        //     delete userData.password;
        //     res.status(200).send(userData)
        //     return;
        //   }
        // }

      },
  
      register: (req, res) => {
        const { firstName, lastName, email, username, password } = req.body;

        let isAdmin = false; // TODO

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
            res.sendStatus(400);
            console.log(err);
        })
      }
}

function validateBody(body, bodyType) {
    let pass = true;
    Object.keys(body).forEach(key => {
        let variable = body[key].split(" ").join("");
        if(variable != body[key]) {
            console.log('Body contains a space in: ' + key);
            pass = false;
        }
        if(body[key] === '') {
            console.log(`${key} cannot be empty.`);
            pass = false;
        }

        if(key === 'password' && pass) pass = checkPassword(body[key]);
    })
    return pass;
}


const passwordRequirements  = {
    // Setting these variables to 0 will disable the check.
    minLength: 8,
    maxLength: 0,
    minSpecialCharacters: 0,
    minCapLetter: 0, 
    minLowercaseLetter: 0,
    minNumber: 1,
}

// Specials character arrays for requirement checking
let specialCharacters  = ['/', '[', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '-', '=', ']', '{', '}', ';', "'", ':', '"', '\\', '|', ",", ".", "<", ">", "?", "+"]
let capitalLetters  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
let lowercaseLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

Object.keys(passwordRequirements).forEach(key => {
    // Double check max Length. Want to make sure it's not below the min requirement.
    if(key === 'maxLength') { 
        passwordRequirement = (passwordRequirements.maxLength < 0 || passwordRequirements.maxLength < passwordRequirements.minLength) ? 0:passwordRequirements.maxLength;
    }
    else {
        passwordRequirements[key] = (passwordRequirements[key] < 0) ? 0:passwordRequirements[key];
    }
})

console.log(passwordRequirements);

function checkPassword(input) {
    let passwordMeetsRequirements = true;
    
    // Finally check for Lord of the Rings fans. Those guys are weird.
    if(input.toUpperCase() === "LOTR" || input.toUpperCase() === "LORDOFTHETHERINGS" || input.toUpperCase() === "LORD OF THE RINGS")
    {
        // They just get an instant fail.
        passwordMeetsRequirements = false;
        console.log("Cannot be a Lord of the rings fan.");
        return;
    }

    // Check password min
    if(passwordRequirements.minLength > 0 && input.length < passwordRequirements.minLength) {
        console.log(`Password is shorter than ${passwordRequirements.minLength} characters in length.`);
        passwordMeetsRequirements = false;
    }  

    // Check password max
    if(passwordRequirements.maxLength > 0 && input.length > passwordRequirements.maxLength) {
        console.log(`Password is longer than ${passwordRequirements.maxLength} characters in length.`);
        passwordMeetsRequirements = false;
    }

    // TODO: code optimization.
    // Object.keys(passwordRequirements).forEach(requirement => {
    //     if(requirement.contains('Length')) console.log('Check length');
    //     else passwordRequirements[key] > 0 && !containsArrayCheck(input, )
    // })

    // Check special characters
    if(passwordRequirements.minSpecialCharacters > 0 && !containsArrayCheck(input, specialCharacters)) {
        console.log(`Password contains less than ${passwordRequirements.minSpecialCharacters} special characters.`);
        passwordMeetsRequirements = false;
    }

    // Check capitalization
    if(passwordRequirements.minCapLetter > 0 && !containsArrayCheck(input, capitalLetters)) {
        console.log(`Password contains less than ${passwordRequirements.minCapLetter} capital letters.`);
        passwordMeetsRequirements = false;
    }

    // Check ...lowercaseization?
    if(passwordRequirements.minLowercaseLetter > 0 && !containsArrayCheck(input, lowercaseLetters)) {
        console.log(`Password contains less than ${passwordRequirements.minLowercaseLetter} lowercase letters.`);
        passwordMeetsRequirements = false;
    }

    // Check min number?
    if(passwordRequirements.minNumber > 0 && !containsArrayCheck(input, numbers)) {
        console.log(`Password contains less than ${passwordRequirements.minNumber} numbers.`);
        passwordMeetsRequirements = false;
    }

    // Finally if the password does or does not meet all of the requirements let the user know.
    if(passwordMeetsRequirements) console.log("Congrats! Your password meets the requirements.");
    else console.log("Sorry but your password did not meet the requirements.");

    return passwordMeetsRequirements;
}

function containsArrayCheck(inputString, arrayToCompare)
{
    tokens = inputString.slice();
    specialSymbolsFound = [];

    containsCharactersFromArray = false;

    for(let i = 0; i < tokens.length; i++) {
        for(let j = 0; j < arrayToCompare.length; j++) {
            if(tokens[i] == arrayToCompare[j]) {
                specialSymbolsFound.push(tokens[i]);
            }
        }
    }
    
    if(specialSymbolsFound.length > 0) containsCharactersFromArray = true;

    return containsCharactersFromArray;
}

