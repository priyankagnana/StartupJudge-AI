// src/routes/simulationRoutes.js

const express = require('express');
const router = express.Router();

const {
  startSimulation,
  startSimulationStream,
} = require('../controllers/simulationController');

router.post('/', startSimulation);
router.post('/stream', startSimulationStream);

module.exports = router;
