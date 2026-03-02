// src/utils/aiClient.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateResponse = async (prompt, retries = 3) => {
  // Use the fast and efficient gemini-2.5-flash model
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    systemInstruction: 'You are an expert startup advisor.'
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        const waitTime = attempt * 15000; // wait 15s, 30s, 45s
        console.warn(`[429 Quota Exceeded] Retrying attempt ${attempt} in ${waitTime/1000} seconds...`);
        if (attempt === retries) throw new Error(`Google API Rate Limit Exceeded. Please try again in 1 minute.`);
        await sleep(waitTime);
        continue;
      }
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
};

module.exports = { generateResponse };