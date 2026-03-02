const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class CTOAgent extends BaseAgent {
  constructor() {
    super('CTO');
  }

  async evaluate(idea) {
    const prompt = `
You are a CTO. Evaluate this startup idea.

Focus on:
- technical feasibility
- scalability
- complexity
- infrastructure needs

Idea:
${idea}
`;
    return generateResponse(prompt);
  }

  async critique(idea, responses) {
    const prompt = `
You are a CTO reviewing other opinions:

${responses.join('\n\n')}

Give technical critique.
`;
    return generateResponse(prompt);
  }
}

module.exports = CTOAgent;