// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getProviderConfig() {
  return {
    provider: localStorage.getItem('ai_provider') || '',
    apiKey: localStorage.getItem('user_api_key') || '',
  };
}

function buildPayload(extra = {}) {
  const { provider, apiKey } = getProviderConfig();
  const payload = { ...extra };
  if (provider) payload.provider = provider;
  if (apiKey) payload.apiKey = apiKey;
  return payload;
}

// Full batch mode (legacy)
export const simulateIdea = async (idea) => {
  const response = await axios.post(`${API_URL}/simulate`, buildPayload({ idea }), { timeout: 120000 });
  return response.data;
};

// Per-round calls — frontend controls pacing
export const fetchRound1 = async (idea) => {
  const response = await axios.post(`${API_URL}/simulate/round1`, buildPayload({ idea }), { timeout: 60000 });
  return response.data; // { agents: { CFO: { assessment, score, risks, recommendation }, ... } }
};

export const fetchRound2 = async (idea, round1Agents) => {
  const response = await axios.post(`${API_URL}/simulate/round2`, buildPayload({ idea, round1Agents }), { timeout: 60000 });
  return response.data; // { agents: { CFO: { critique, agreements, disagreements }, ... } }
};

export const fetchDecision = async (idea, round1Agents, round2Agents) => {
  const response = await axios.post(`${API_URL}/simulate/decide`, buildPayload({ idea, round1Agents, round2Agents }), { timeout: 60000 });
  return response.data; // { score, decision, confidenceLevel, ... }
};
