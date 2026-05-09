// src/providers/providerFactory.js

const GeminiProvider = require('./geminiProvider');
const GroqProvider = require('./groqProvider');
const CerebrasProvider = require('./cerebrasProvider');
const OpenRouterProvider = require('./openrouterProvider');

const providers = {
  gemini: GeminiProvider,
  groq: GroqProvider,
  cerebras: CerebrasProvider,
  openrouter: OpenRouterProvider,
};

function createProvider(name, apiKey) {
  const normalizedName = (name || '').toLowerCase();
  const ProviderClass = providers[normalizedName];

  if (!ProviderClass) {
    throw new Error(`Unknown provider: "${name}". Available: ${Object.keys(providers).join(', ')}`);
  }

  return new ProviderClass(apiKey);
}

module.exports = { createProvider };
