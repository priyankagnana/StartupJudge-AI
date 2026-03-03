const CFOAgent = require('../agents/cfoAgent');
const CTOAgent = require('../agents/ctoAgent');
const LegalAgent = require('../agents/legalAgent');
const MarketingAgent = require('../agents/marketingAgent');
const HRAgent = require('../agents/hrAgent');
const MarketAgent = require('../agents/marketAgent');

const MemoryService = require('./memoryService');
const decisionService = require('./decisionService');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.runSimulation = async (idea) => {
  const memory = new MemoryService();

  const agents = [
    new CFOAgent(),
    new CTOAgent(),
    new LegalAgent(),
    new MarketingAgent(),
    new HRAgent(),
    new MarketAgent(),
  ];

  const results = {};

  // 🔹 Round 1
  for (let agent of agents) {
    const response = await agent.evaluate(idea);
    memory.save(agent.role, response);
    results[agent.role] = { round1: response };
    await sleep(2000); // 2 second delay to drastically reduce rate limit crashes
  }

  // 🔹 Round 2
  for (let agent of agents) {
    const critique = await agent.critique(idea, memory.getAll());
    results[agent.role].round2 = critique;
    await sleep(2000);
  }

  // 🔹 Decision
  const decision = decisionService.generateDecision(memory.getAll());

  return {
    idea,
    agents: results,
    finalDecision: decision,
  };
};