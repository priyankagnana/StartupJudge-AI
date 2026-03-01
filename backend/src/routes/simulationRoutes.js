// src/routes/simulationRoutes.js

const express = require('express');
const router = express.Router();

const {
  startSimulation,
} = require('../controllers/simulationController');

router.post('/', startSimulation);

module.exports = router;