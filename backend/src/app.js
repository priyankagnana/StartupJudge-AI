// src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const simulationRoutes = require('./routes/simulationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/simulate', simulationRoutes);

module.exports = app;