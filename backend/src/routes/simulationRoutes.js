// src/routes/simulationRoutes.js

const express = require('express');
const router = express.Router();

const {
  startSimulation,
  round1,
  round2,
  decide,
} = require('../controllers/simulationController');

router.post('/', startSimulation);
router.post('/round1', round1);
router.post('/round2', round2);
router.post('/decide', decide);

module.exports = router;
