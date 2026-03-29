// src/agents/ctoAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class CTOAgent extends BaseAgent {
  constructor() {
    super('CTO');
  }

  async evaluate(idea, providerOptions = {}) {
    const prompt = `You are a CTO evaluating a startup idea. Analyze: technical feasibility, system complexity, scalability challenges, infrastructure requirements, engineering risk.

Startup Idea: ${idea}

Respond in 150 words max. Return ONLY valid JSON:
{"assessment": "<2-3 sentence analysis>", "score": <0-100 feasibility>, "risks": ["<risk1>", "<risk2>"], "recommendation": "<1 sentence>"}`;

    return generateResponse(prompt, providerOptions);
  }

  async critique(idea, summary, providerOptions = {}) {
    const prompt = `You are a CTO reviewing other experts' evaluations of this startup idea.

Expert summaries:
${summary}

Identify technical concerns others missed and note where you agree or disagree. Respond in 150 words max. Return ONLY valid JSON:
{"critique": "<your technical critique>", "agreements": ["<point1>"], "disagreements": ["<point1>"]}`;

    return generateResponse(prompt, providerOptions);
  }
}

module.exports = CTOAgent;
