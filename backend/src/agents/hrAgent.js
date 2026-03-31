// src/agents/hrAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class HRAgent extends BaseAgent {
  constructor() {
    super('HR');
  }

  async evaluate(idea, providerOptions = {}) {
    const prompt = `You are an HR/Talent Advisor evaluating a startup idea. Analyze: hiring difficulty, talent availability, skill specialization needs, team dependency risk, founder workload pressure, compensation burden.

Startup Idea: ${idea}

Respond in 150 words max. Return ONLY valid JSON:
{"assessment": "<2-3 sentence analysis>", "score": <0-100 feasibility>, "risks": ["<risk1>", "<risk2>"], "recommendation": "<1 sentence>"}`;

    return generateResponse(prompt, providerOptions);
  }

  async critique(idea, summary, providerOptions = {}) {
    const prompt = `You are an HR/Talent Advisor reviewing other experts' evaluations of this startup idea.

Expert summaries:
${summary}

Identify talent/team concerns others missed and note where you agree or disagree. Respond in 150 words max. Return ONLY valid JSON:
{"critique": "<your talent critique>", "agreements": ["<point1>"], "disagreements": ["<point1>"]}`;

    return generateResponse(prompt, providerOptions);
  }
}

module.exports = HRAgent;
