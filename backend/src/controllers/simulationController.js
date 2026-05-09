// src/controllers/simulationController.js

const orchestratorService = require('../services/orchestratorService');
const { generateQuestionsForIdea } = require('../services/questionService');

exports.startSimulation = async (req, res) => {
  try {
    const { idea, provider, apiKey } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    console.log(`[Request] idea="${idea.substring(0, 50)}..." provider=${provider || 'default'}`);
    const result = await orchestratorService.runSimulation(idea, { provider, apiKey });
    console.log('[Response] Sending result to frontend, keys:', Object.keys(result));
    res.json(result);
  } catch (error) {
    console.error("Simulation failed:", error);
    const is429 = error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('quota');
    const statusCode = is429 ? 429 : 500;
    res.status(statusCode).json({
      error: is429
        ? 'API rate limit exceeded. The free quota has been used up.'
        : (error.message || 'Something went wrong during simulation'),
      code: is429 ? 'RATE_LIMIT' : 'SERVER_ERROR',
    });
  }
};

exports.generateQuestions = async (req, res) => {
  try {
    const { idea, provider, apiKey } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    console.log(`[Questions API] idea="${idea.substring(0, 50)}..."`);
    const questions = await generateQuestionsForIdea(idea, { provider, apiKey });

    if (!questions) {
      return res.status(200).json({ questions: null });
    }

    res.json({ questions });
  } catch (error) {
    console.error('[Questions API] Failed:', error.message);
    res.status(200).json({ questions: null });
  }
};

// Per-round endpoints — frontend calls these one by one
exports.round1 = async (req, res) => {
  try {
    const { idea, provider, apiKey } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    console.log(`[Round 1 API] idea="${idea.substring(0, 50)}..."`);
    const result = await orchestratorService.runRound1(idea, { provider, apiKey });
    res.json(result);
  } catch (error) {
    console.error('[Round 1 API] Failed:', error.message);
    const is429 = error.message?.includes('429') || error.message?.includes('rate limit');
    res.status(is429 ? 429 : 500).json({
      error: is429 ? 'API rate limit exceeded.' : error.message,
      code: is429 ? 'RATE_LIMIT' : 'SERVER_ERROR',
    });
  }
};

exports.round2 = async (req, res) => {
  try {
    const { idea, round1Agents, provider, apiKey } = req.body;
    if (!idea || !round1Agents) return res.status(400).json({ error: 'Idea and round1Agents are required' });

    console.log(`[Round 2 API] idea="${idea.substring(0, 50)}..."`);
    const result = await orchestratorService.runRound2(idea, round1Agents, { provider, apiKey });
    res.json(result);
  } catch (error) {
    console.error('[Round 2 API] Failed:', error.message);
    const is429 = error.message?.includes('429') || error.message?.includes('rate limit');
    res.status(is429 ? 429 : 500).json({
      error: is429 ? 'API rate limit exceeded.' : error.message,
      code: is429 ? 'RATE_LIMIT' : 'SERVER_ERROR',
    });
  }
};

exports.decide = async (req, res) => {
  try {
    const { idea, round1Agents, round2Agents, provider, apiKey } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    console.log(`[Decision API] idea="${idea.substring(0, 50)}..."`);
    const result = await orchestratorService.runDecision(idea, round1Agents, round2Agents, { provider, apiKey });
    res.json(result);
  } catch (error) {
    console.error('[Decision API] Failed:', error.message);
    const is429 = error.message?.includes('429') || error.message?.includes('rate limit');
    res.status(is429 ? 429 : 500).json({
      error: is429 ? 'API rate limit exceeded.' : error.message,
      code: is429 ? 'RATE_LIMIT' : 'SERVER_ERROR',
    });
  }
};
