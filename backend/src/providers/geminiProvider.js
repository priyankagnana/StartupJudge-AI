// src/providers/geminiProvider.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseProvider = require('./baseProvider');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GeminiProvider extends BaseProvider {
  constructor(apiKey) {
    super(apiKey);
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  async generate(prompt, options = {}) {
    const { maxTokens = 400, retries = 1 } = options;

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: 'You are an expert startup advisor. Always respond with valid JSON only, no markdown.',
      generationConfig: {
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
          const waitTime = attempt * 15000;
          console.warn(`[Gemini 429] Retry ${attempt}/${retries} in ${waitTime / 1000}s...`);
          if (attempt === retries) throw error;
          await sleep(waitTime);
          continue;
        }
        throw error;
      }
    }
  }
}

module.exports = GeminiProvider;
