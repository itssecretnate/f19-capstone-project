require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');

const {seed} = require('./seedDB.js');

app.use(express.json())
app.use(cors())

// Middleware setup (Send HTML to page)
app.use(express.static(path.join(__dirname, '../public')));

app.post('/seed', seed);

const SERVER_PORT = process.SERVER_PORT || 42069;
app.listen(SERVER_PORT, () => console.log(`Server running on: ${SERVER_PORT}`))