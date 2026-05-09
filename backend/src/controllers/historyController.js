const Simulation = require('../models/Simulation');

exports.list = async (req, res) => {
  try {
    const simulations = await Simulation.find(
      { userId: req.user.id },
      { idea: 1, verdict: 1, score: 1, status: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ simulations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch simulations' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const sim = await Simulation.findById(req.params.id).lean();
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    if (sim.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    res.json({ simulation: sim });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch simulation' });
  }
};

exports.create = async (req, res) => {
  try {
    const { idea, qaAnswers, provider } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const sim = await Simulation.create({
      userId: req.user.id,
      idea,
      qaAnswers,
      provider,
    });
    res.status(201).json({ simulation: { _id: sim._id, idea: sim.idea, status: sim.status, createdAt: sim.createdAt } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create simulation' });
  }
};

exports.update = async (req, res) => {
  try {
    const sim = await Simulation.findById(req.params.id);
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    if (sim.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const allowed = ['round1Data', 'round2Data', 'decision', 'verdict', 'score', 'status'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) sim[key] = req.body[key];
    }
    await sim.save();
    res.json({ simulation: { _id: sim._id, status: sim.status } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update simulation' });
  }
};

exports.remove = async (req, res) => {
  try {
    const sim = await Simulation.findById(req.params.id);
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    if (sim.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await sim.deleteOne();
    res.json({ message: 'Simulation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete simulation' });
  }
};
