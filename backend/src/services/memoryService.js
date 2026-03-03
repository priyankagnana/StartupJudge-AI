class MemoryService {
  constructor() {
    this.responses = [];
  }

  save(role, response) {
    this.responses.push({ role, response });
  }

  getAll() {
    return this.responses.map(r => `${r.role}: ${r.response}`);
  }
}

module.exports = MemoryService;