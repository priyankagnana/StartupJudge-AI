// src/agents/cfoAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class CFOAgent extends BaseAgent {
  constructor() {
    super('CFO');
  }

  async evaluate(idea, providerOptions = {}) {
    const prompt = `You are a CFO evaluating a startup idea. Analyze: cost structure, revenue model, burn rate risk, margin sustainability, funding dependency, capital efficiency.

Startup Idea: ${idea}

Respond in 150 words max. Return ONLY valid JSON:
{"assessment": "<2-3 sentence analysis>", "score": <0-100 feasibility>, "risks": ["<risk1>", "<risk2>"], "recommendation": "<1 sentence>"}`;

    return generateResponse(prompt, providerOptions);
  }

  async critique(idea, summary, providerOptions = {}) {
    const prompt = `You are a CFO reviewing other experts' evaluations of this startup idea.

Expert summaries:
${summary}

Identify financial concerns others missed and note where you agree or disagree. Respond in 150 words max. Return ONLY valid JSON:
{"critique": "<your financial critique>", "agreements": ["<point1>"], "disagreements": ["<point1>"]}`;

    return generateResponse(prompt, providerOptions);
  }
}

module.exports = CFOAgent;
