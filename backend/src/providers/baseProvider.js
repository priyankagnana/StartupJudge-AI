// src/providers/baseProvider.js

class BaseProvider {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error(`API key is required for ${this.constructor.name}`);
    }
    this.apiKey = apiKey;
  }

  async generate(prompt, options = {}) {
    throw new Error('generate() must be implemented by provider subclass');
  }
}

module.exports = BaseProvider;
