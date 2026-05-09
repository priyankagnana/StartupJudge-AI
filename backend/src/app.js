// src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const passport = require('./config/passport');
const simulationRoutes = require('./routes/simulationRoutes');
const authRoutes = require('./routes/authRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/simulate', simulationRoutes);
app.use('/api/history', historyRoutes);

module.exports = app;