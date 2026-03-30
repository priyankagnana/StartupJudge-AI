// src/agents/marketingAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class MarketingAgent extends BaseAgent {
  constructor() {
    super('Marketing');
  }

  async evaluate(idea, providerOptions = {}) {
    const prompt = `You are a Marketing Strategist evaluating a startup idea. Analyze: demand potential, positioning clarity, acquisition channels, brand differentiation, growth strategy.

Startup Idea: ${idea}

Respond in 150 words max. Return ONLY valid JSON:
{"assessment": "<2-3 sentence analysis>", "score": <0-100 feasibility>, "risks": ["<risk1>", "<risk2>"], "recommendation": "<1 sentence>"}`;

    return generateResponse(prompt, providerOptions);
  }

  async critique(idea, summary, providerOptions = {}) {
    const prompt = `You are a Marketing Strategist reviewing other experts' evaluations of this startup idea.

Expert summaries:
${summary}

Identify marketing concerns others missed and note where you agree or disagree. Respond in 150 words max. Return ONLY valid JSON:
{"critique": "<your marketing critique>", "agreements": ["<point1>"], "disagreements": ["<point1>"]}`;

    return generateResponse(prompt, providerOptions);
  }
}

module.exports = MarketingAgent;
