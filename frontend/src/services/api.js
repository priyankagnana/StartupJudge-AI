// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const simulateIdea = async (idea) => {
  try {
    const response = await axios.post(`${API_URL}/simulate`, { idea });
    return response.data;
  } catch (error) {
    console.error("Error running simulation:", error);
    throw error;
  }
};
