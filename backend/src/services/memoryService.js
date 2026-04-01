// src/services/memoryService.js

class MemoryService {
  constructor() {
    this.responses = [];
  }

  save(role, round, rawResponse, parsedJSON = null) {
    this.responses.push({
      role,
      round,
      rawResponse,
      parsedJSON,
      timestamp: Date.now(),
    });
  }

  getRound(n) {
    return this.responses.filter(r => r.round === n);
  }

  getByRole(role) {
    return this.responses.filter(r => r.role === role);
  }

  getSummary() {
    return this.getRound(1)
      .map(r => {
        const p = r.parsedJSON;
        if (p) {
          return `${r.role}: Score ${p.score}/100. ${p.assessment}`;
        }
        return `${r.role}: ${r.rawResponse.substring(0, 200)}`;
      })
      .join('\n');
  }

  getAll() {
    return this.responses;
  }
}

module.exports = MemoryService;
