const Sequelize = require('sequelize');

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
            res.sendStatus(200);
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
            res.status(400).send(err.errors[0].message);
            console.log(err.errors[0].message);
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
    }
}
