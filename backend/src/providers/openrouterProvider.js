const BaseProvider = require('./baseProvider');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class OpenRouterProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'google/gemma-4-31b-it:free';
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
            'HTTP-Referer': 'https://startupjudge.ai',
            'X-Title': 'StartupJudge AI',
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
          console.warn(`[OpenRouter 429] Retry ${attempt}/${retries} in ${waitTime / 1000}s...`);
          if (attempt === retries) throw new Error('OpenRouter rate limit exceeded');
          await sleep(waitTime);
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        if (error.message?.includes('429') && attempt < retries) {
          await sleep(attempt * 5000);
          continue;
        }
        throw error;
      }
    }
  }
}

module.exports = OpenRouterProvider;
