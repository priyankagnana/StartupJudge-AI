// src/agents/cfoAgent.js

const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class CFOAgent extends BaseAgent {
  constructor() {
    super('CFO');
  }

  async evaluate(idea) {
    const prompt = `
You are a CFO. Evaluate the following startup idea.

Focus on:
- cost structure
- revenue model
- profitability
- financial risks

Startup Idea:
${idea}
`;

    return await generateResponse(prompt);
  }

  async critique(idea, otherResponses) {
    const prompt = `
You are a CFO reviewing other experts' opinions.

Other responses:
${otherResponses.join('\n\n')}

Give financial critique.
`;

    return await generateResponse(prompt);
  }
}

module.exports = CFOAgent;