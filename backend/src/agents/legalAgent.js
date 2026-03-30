// src/agents/legalAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class LegalAgent extends BaseAgent {
  constructor() {
    super('Legal');
  }

  async evaluate(idea, providerOptions = {}) {
    const prompt = `You are a Legal Advisor evaluating a startup idea. Analyze: regulatory exposure, licensing needs, compliance requirements, contract dependency, legal barriers.

Startup Idea: ${idea}

Respond in 150 words max. Return ONLY valid JSON:
{"assessment": "<2-3 sentence analysis>", "score": <0-100 feasibility>, "risks": ["<risk1>", "<risk2>"], "recommendation": "<1 sentence>"}`;

    return generateResponse(prompt, providerOptions);
  }

  async critique(idea, summary, providerOptions = {}) {
    const prompt = `You are a Legal Advisor reviewing other experts' evaluations of this startup idea.

Expert summaries:
${summary}

Identify legal concerns others missed and note where you agree or disagree. Respond in 150 words max. Return ONLY valid JSON:
{"critique": "<your legal critique>", "agreements": ["<point1>"], "disagreements": ["<point1>"]}`;

    return generateResponse(prompt, providerOptions);
  }
}

module.exports = LegalAgent;
