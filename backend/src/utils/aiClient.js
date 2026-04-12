// src/utils/aiClient.js

const { createProvider } = require('../providers/providerFactory');

const KEY_MAP = {
  cerebras: 'CEREBRAS_API_KEY',
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
};

const FALLBACK_CHAIN = {
  cerebras: ['gemini', 'groq'],
  gemini: ['cerebras', 'groq'],
  groq: ['cerebras', 'gemini'],
};

function resolveProvider(providerName, apiKey) {
  const name = providerName || process.env.DEFAULT_PROVIDER || 'cerebras';
  const key = apiKey || process.env[KEY_MAP[name]];
  if (!key) return null;
  try {
    return { provider: createProvider(name, key), name };
  } catch {
    return null;
  }
}

const generateResponse = async (prompt, options = {}) => {
  const { provider: providerName, apiKey, maxTokens = 400 } = options;

  const primaryName = providerName || process.env.DEFAULT_PROVIDER || 'cerebras';
  const primary = resolveProvider(primaryName, apiKey);
  if (!primary) throw new Error(`No valid API key configured for ${primaryName}`);

  try {
    return await primary.provider.generate(prompt, { maxTokens });
  } catch (error) {
    const shouldFallback = error.status === 429 || error.status === 402
      || error.status === 500 || error.status === 502 || error.status === 503
      || error.message?.includes('429') || error.message?.includes('402')
      || error.message?.includes('rate limit') || error.message?.includes('quota')
      || error.message?.includes('PAYMENT') || error.message?.includes('balance')
      || error.message?.includes('503') || error.message?.includes('server');

    if (shouldFallback) {
      const fallbacks = FALLBACK_CHAIN[primary.name] || [];
      for (const fallbackName of fallbacks) {
        const fallback = resolveProvider(fallbackName);
        if (!fallback) continue;

        console.log(`[Fallback] ${primary.name} failed → trying ${fallbackName}...`);
        try {
          return await fallback.provider.generate(prompt, { maxTokens });
        } catch (fallbackError) {
          const fallbackFailed = fallbackError.message?.includes('429') || fallbackError.message?.includes('402')
            || fallbackError.message?.includes('503') || fallbackError.message?.includes('server')
            || fallbackError.message?.includes('rate limit') || fallbackError.message?.includes('PAYMENT');
          if (fallbackFailed) {
            console.warn(`[Fallback] ${fallbackName} also failed, trying next...`);
            continue;
          }
          throw fallbackError;
        }
      }
      throw new Error('All API providers are rate limited. Please wait a few minutes or add your own API key.');
    }
    throw error;
  }
};

module.exports = { generateResponse };
