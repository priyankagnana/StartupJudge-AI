const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class MarketAgent extends BaseAgent {
  constructor() {
    super('Market Research');
  }

  async evaluate(idea) {
    const prompt = `
You are a Market Research Analyst.

Analyze:
- competition
- market size
- saturation
- opportunity

Idea:
${idea}
`;
    return generateResponse(prompt);
  }

  async critique(idea, responses) {
    const prompt = `
Analyze market conflicts:

${responses.join('\n\n')}
`;
    return generateResponse(prompt);
  }
}

module.exports = MarketAgent;