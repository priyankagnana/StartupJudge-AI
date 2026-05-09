import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({ baseURL: API_URL, timeout: 120000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const generateQuestions = async (idea) => {
  const response = await api.post('/simulate/questions', buildPayload({ idea }), { timeout: 15000 });
  return response.data;
};

export const simulateIdea = async (idea) => {
  const response = await api.post('/simulate', buildPayload({ idea }));
  return response.data;
};

export const fetchRound1 = async (idea) => {
  const response = await api.post('/simulate/round1', buildPayload({ idea }), { timeout: 60000 });
  return response.data;
};

export const fetchRound2 = async (idea, round1Agents) => {
  const response = await api.post('/simulate/round2', buildPayload({ idea, round1Agents }), { timeout: 60000 });
  return response.data;
};

export const fetchDecision = async (idea, round1Agents, round2Agents) => {
  const response = await api.post('/simulate/decide', buildPayload({ idea, round1Agents, round2Agents }), { timeout: 60000 });
  return response.data;
};

export const listSimulations = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getSimulation = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const createSimulation = async (data) => {
  const response = await api.post('/history', data);
  return response.data;
};

export const updateSimulation = async (id, data) => {
  const response = await api.patch(`/history/${id}`, data);
  return response.data;
};

export const deleteSimulation = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};
