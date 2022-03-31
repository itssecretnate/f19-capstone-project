require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');

const {seed} = require('./seedDB.js');
const {getAssets, getAssetByID, getManufacturers, getModels, createAsset, updateAsset, deleteAsset, login, register, putManufacturer, postManufacturer, deleteManufacturer, putModel, postModel, deleteModel} = require('./controller.js');

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

app.get('/account', (req, res) => {
    res.sendFile(publicfolder + 'login.html')
})

app.get('/models', (req, res) => {
    res.sendFile(publicfolder + 'models.html')
})

// Endpoints

app.post('/api/seed', seed);
app.post('/api/register', register);
app.post('/api/new/asset', createAsset);

app.delete('/api/delete/:id', deleteAsset);

app.put('/api/update/asset', updateAsset);

app.get('/api/assets', getAssets);
app.get('/api/models/:id', getModels);
app.get('/api/assets/:id', getAssetByID);
app.get('/api/manufacturers', getManufacturers);

app.post('/api/login', login);

app.post('/api/manufacturers/', postManufacturer)
app.put('/api/manufacturers/:id', putManufacturer)
app.delete('/api/manufacturers/:id', deleteManufacturer)


app.post('/api/models/', postModel)
app.put('/api/models/:id', putModel)
app.delete('/api/models/:id', deleteModel)

const SERVER_PORT = process.SERVER_PORT || 42069;
app.listen(SERVER_PORT, () => console.log(`Server running on: ${SERVER_PORT}`))
