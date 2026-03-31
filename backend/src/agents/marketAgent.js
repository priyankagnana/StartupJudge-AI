// src/agents/marketAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class MarketAgent extends BaseAgent {
  constructor() {
    super('Market Research');
  }

  async evaluate(idea, providerOptions = {}) {
    const prompt = `You are a Market Research Analyst evaluating a startup idea. Analyze: competition density, market saturation risk, niche strength, demand signals, differentiation gap, entry barrier level.

Startup Idea: ${idea}

Respond in 150 words max. Return ONLY valid JSON:
{"assessment": "<2-3 sentence analysis>", "score": <0-100 feasibility>, "risks": ["<risk1>", "<risk2>"], "recommendation": "<1 sentence>"}`;

    return generateResponse(prompt, providerOptions);
  }

  async critique(idea, summary, providerOptions = {}) {
    const prompt = `You are a Market Research Analyst reviewing other experts' evaluations of this startup idea.

Expert summaries:
${summary}

Identify market/competition concerns others missed and note where you agree or disagree. Respond in 150 words max. Return ONLY valid JSON:
{"critique": "<your market critique>", "agreements": ["<point1>"], "disagreements": ["<point1>"]}`;

    return generateResponse(prompt, providerOptions);
  }
}

module.exports = MarketAgent;
