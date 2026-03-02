const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class HRAgent extends BaseAgent {
  constructor() {
    super('HR');
  }

  async evaluate(idea) {
    const prompt = `
You are an HR expert.

Analyze:
- hiring difficulty
- team size
- skill requirements
- cost of talent

Idea:
${idea}
`;
    return generateResponse(prompt);
  }

  async critique(idea, responses) {
    const prompt = `
Evaluate team challenges based on:

${responses.join('\n\n')}
`;
    return generateResponse(prompt);
  }
}

module.exports = HRAgent;