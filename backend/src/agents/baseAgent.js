// src/agents/baseAgent.js

class BaseAgent {
  constructor(role) {
    this.role = role;
  }

  async evaluate(idea) {
    throw new Error('evaluate() must be implemented');
  }

  async critique(idea, otherResponses) {
    throw new Error('critique() must be implemented');
  }
}

module.exports = BaseAgent;