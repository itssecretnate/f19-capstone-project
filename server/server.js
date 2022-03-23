require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');

const {seed} = require('./seedDB.js');
const {getAssets, getAssetByID, getManufacturers, createAsset, updateAsset, deleteAsset} = require('./controller.js');

app.use(express.json())
app.use(cors())

// Middleware setup (Send HTML to page)

const publicfolder = path.join(__dirname, '../public/')

app.use(express.static(publicfolder));

app.get('/', (req, res) => { res.sendFile(publicfolder + 'index.html')
})

app.get('/assets', (req, res) => {
    res.sendFile(publicfolder + 'asset.html')
})

// Endpoints

app.post('/api/seed', seed);
app.post('/api/new/asset', createAsset);

app.delete('/api/delete/:id', deleteAsset)

app.put('/api/update/asset', updateAsset);

app.get('/api/assets', getAssets);
app.get('/api/assets/:id', getAssetByID);
app.get('/api/manufacturers', getManufacturers)

const SERVER_PORT = process.SERVER_PORT || 42069;
app.listen(SERVER_PORT, () => console.log(`Server running on: ${SERVER_PORT}`))