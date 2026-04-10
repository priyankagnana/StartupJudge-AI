// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function getProviderConfig() {
  return {
    provider: localStorage.getItem('ai_provider') || '',
    apiKey: localStorage.getItem('user_api_key') || '',
  };
}

// Batch mode — returns full result
export const simulateIdea = async (idea) => {
  const { provider, apiKey } = getProviderConfig();
  const payload = { idea };
  if (provider) payload.provider = provider;
  if (apiKey) payload.apiKey = apiKey;

  const response = await axios.post(`${API_URL}/simulate`, payload, { timeout: 120000 });
  return response.data;
};

// Stream mode — calls onEvent for each SSE event, returns AbortController
export const simulateIdeaStream = (idea, onEvent) => {
  const abortController = new AbortController();
  const { provider, apiKey } = getProviderConfig();

  const payload = { idea };
  if (provider) payload.provider = provider;
  if (apiKey) payload.apiKey = apiKey;

  const run = async () => {
    try {
      const response = await fetch(`${API_URL}/simulate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'Simulation failed';
        try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
        onEvent({ type: 'error', data: { message: errMsg } });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // keep incomplete chunk

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(trimmed.slice(6));
            onEvent(event);
          } catch {
            // skip malformed events
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const event = JSON.parse(buffer.trim().slice(6));
          onEvent(event);
        } catch {}
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        onEvent({ type: 'error', data: { message: error.message } });
      }
    }
  };

  run();
  return abortController;
};
