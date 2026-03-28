// src/agents/agentFactory.js

const CFOAgent = require('./cfoAgent');
const CTOAgent = require('./ctoAgent');
const LegalAgent = require('./legalAgent');
const MarketingAgent = require('./marketingAgent');
const HRAgent = require('./hrAgent');
const MarketAgent = require('./marketAgent');

class AgentFactory {
  constructor() {
    this.registry = new Map();

    // Register all default agents
    this.register('CFO', CFOAgent);
    this.register('CTO', CTOAgent);
    this.register('Legal', LegalAgent);
    this.register('Marketing', MarketingAgent);
    this.register('HR', HRAgent);
    this.register('Market Research', MarketAgent);
  }

  register(role, AgentClass) {
    this.registry.set(role, AgentClass);
  }

  create(role) {
    const AgentClass = this.registry.get(role);
    if (!AgentClass) {
      throw new Error(`No agent registered for role: "${role}"`);
    }
    return new AgentClass();
  }

  createAll() {
    return Array.from(this.registry.values()).map(AgentClass => new AgentClass());
  }

  getRoles() {
    return Array.from(this.registry.keys());
  }
}

module.exports = new AgentFactory();
