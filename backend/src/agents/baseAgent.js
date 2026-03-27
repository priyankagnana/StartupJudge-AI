// src/agents/baseAgent.js

class BaseAgent {
  constructor(role) {
    this.role = role;
  }

  async evaluate(idea, providerOptions = {}) {
    throw new Error('evaluate() must be implemented');
  }

  async critique(idea, otherResponses, providerOptions = {}) {
    throw new Error('critique() must be implemented');
  }
}

module.exports = BaseAgent;
