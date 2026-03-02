const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class MarketingAgent extends BaseAgent {
  constructor() {
    super('Marketing');
  }

  async evaluate(idea) {
    const prompt = `
You are a Marketing Expert.

Analyze:
- demand
- target audience
- growth strategy
- positioning

Idea:
${idea}
`;
    return generateResponse(prompt);
  }

  async critique(idea, responses) {
    const prompt = `
Analyze marketing disagreements:

${responses.join('\n\n')}
`;
    return generateResponse(prompt);
  }
}

module.exports = MarketingAgent;