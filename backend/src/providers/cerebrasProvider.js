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
    const { maxTokens = 400, retries = 2 } = options;

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
        const content = data.choices[0].message.content;

        // Detect garbage responses (control chars filling >10% of output)
        const controlChars = (content.match(/[\x00-\x1F\x7F]/g) || []).length;
        if (controlChars > content.length * 0.1) {
          console.warn(`[Cerebras] Garbage response detected (${controlChars}/${content.length} control chars), retry ${attempt}/${retries}`);
          if (attempt < retries) { await sleep(2000); continue; }
          // Last attempt — still return it, cleanResponse will strip the junk
        }

        return content;
      } catch (error) {
        if ((error.message?.includes('429') || error.message?.includes('503')) && attempt < retries) {
          await sleep(attempt * 5000);
          continue;
        }
        throw error;
      }
    }
  }
}

module.exports = CerebrasProvider;
