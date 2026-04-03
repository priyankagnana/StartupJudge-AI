// src/utils/rateLimiter.js

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runWithConcurrency(tasks, limit, delayMs = 0) {
  const results = [];

  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(fn => fn()));
    results.push(...batchResults);

    const hasMoreBatches = i + limit < tasks.length;
    if (hasMoreBatches && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return results;
}

function getConcurrencyConfig(provider) {
  if (provider === 'groq') {
    // Groq free: 30 RPM — run 2 at a time with 5s gap
    return { limit: 2, delayMs: 5000 };
  }
  // Gemini free: 15 RPM for 2.0-flash — run 1 at a time with 4s gap
  return { limit: 1, delayMs: 4000 };
}

module.exports = { runWithConcurrency, getConcurrencyConfig };
