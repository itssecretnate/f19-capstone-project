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
            console.log('There was a query passed through.');
            // if(queries[0] === 'name') console.log('Name query');
            queries.forEach(qry => {
                if (qry === 'name') console.log(Object.values(query));
            })
            res.sendStatus(200);
        }
        else { 
            console.log('No queries');
            sequelize.query(`
            SELECT a.asset_id, a.name, m.name as Manufacturer, mdl.name as Model FROM asset as a
    JOIN manufacturer m on a.manufacturer = m.manufacturer_id
    JOIN model mdl on a.model = mdl.model_id;
            `).then(dbRes => res.status(200).send(dbRes[0])).catch(err => res.status(400).send('I am error.'));
    }
},
    
    gettAssetByID: (req, res) => {
        console.log(req.params.id);
        sequelize.query(`
        SELECT a.asset_id, a.name, m.name as Manufacturer, mdl.name as Model FROM asset as a
JOIN manufacturer m on a.manufacturer = m.manufacturer_id
JOIN model mdl on a.model = mdl.model_id
WHERE a.asset_id = ${req.params.id};
        `).then(dbRes => res.status(200).send(dbRes[0])).catch(err => res.status(400).send('I am error.'));
    }
}