// src/providers/cerebrasProvider.js

const BaseProvider = require('./baseProvider');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CerebrasProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseUrl = 'https://api.cerebras.ai/v1/chat/completions';
    this.model = 'qwen-3-235b-a22b-instruct-2507';
  }

  async generate(prompt, options = {}) {
    const { maxTokens = 400, retries = 1 } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: 'You are an expert startup advisor. Always respond with valid JSON only, no markdown.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: maxTokens,
            temperature: 0.7,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.status === 429) {
          const waitTime = attempt * 10000;
          console.warn(`[Cerebras 429] Retry ${attempt}/${retries} in ${waitTime / 1000}s...`);
          if (attempt === retries) throw new Error('Cerebras rate limit exceeded');
          await sleep(waitTime);
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Cerebras API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        if (error.message?.includes('429') && attempt < retries) continue;
        throw error;
      }
    }
  }
}

module.exports = CerebrasProvider;
