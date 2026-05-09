const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  idea: { type: String, required: true },
  qaAnswers: {
    targetMarket: String,
    revenueModel: String,
    stage: String,
    team: String,
    budget: String,
  },
  round1Data: { type: mongoose.Schema.Types.Mixed },
  round2Data: { type: mongoose.Schema.Types.Mixed },
  decision: { type: mongoose.Schema.Types.Mixed },
  verdict: { type: String, enum: ['GO', 'PIVOT', 'NO-GO'] },
  score: { type: Number },
  status: {
    type: String,
    enum: ['in_progress', 'complete', 'failed'],
    default: 'in_progress',
  },
  provider: { type: String },
}, { timestamps: true });

simulationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Simulation', simulationSchema);
