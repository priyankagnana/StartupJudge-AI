// src/controllers/simulationController.js

const orchestratorService = require('../services/orchestratorService');

exports.startSimulation = async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: 'Idea is required' });
    }

    const result = await orchestratorService.runSimulation(idea);

    res.json(result);
  } catch (error) {
    console.error("Simulation failed:", error);
    res.status(500).json({ error: error.message || 'Something went wrong during simulation' });
  }
};