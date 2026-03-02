const BaseAgent = require('./baseAgent');
const { generateResponse } = require('../utils/aiClient');

class LegalAgent extends BaseAgent {
  constructor() {
    super('Legal');
  }

  async evaluate(idea) {
    const prompt = `
You are a Legal Advisor.

Check:
- regulations
- compliance
- risks
- licenses needed

Idea:
${idea}
`;
    return generateResponse(prompt);
  }

  async critique(idea, responses) {
    const prompt = `
Review legal risks based on:

${responses.join('\n\n')}
`;
    return generateResponse(prompt);
  }
}

module.exports = LegalAgent;