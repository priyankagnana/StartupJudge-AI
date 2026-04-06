// src/controllers/simulationController.js

const orchestratorService = require('../services/orchestratorService');

exports.startSimulation = async (req, res) => {
  try {
    const { idea, provider, apiKey } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    console.log(`[Request] idea="${idea.substring(0, 50)}..." provider=${provider || 'default'}`);
    const result = await orchestratorService.runSimulation(idea, { provider, apiKey });
    console.log('[Response] Sending result to frontend, keys:', Object.keys(result));
    res.json(result);
  } catch (error) {
    console.error("Simulation failed:", error);
    const is429 = error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('quota');
    const statusCode = is429 ? 429 : 500;
    res.status(statusCode).json({
      error: is429
        ? 'API rate limit exceeded. The free quota has been used up.'
        : (error.message || 'Something went wrong during simulation'),
      code: is429 ? 'RATE_LIMIT' : 'SERVER_ERROR',
    });
  }
};

exports.startSimulationStream = async (req, res) => {
  const { idea, provider, apiKey } = req.body;
  if (!idea) return res.status(400).json({ error: 'Idea is required' });

  // SSE headers — disable all buffering
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let closed = false;

  const sendEvent = (type, data) => {
    if (closed) return;
    const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
    res.write(payload);
    // Flush if available (needed for some middleware/proxies)
    if (typeof res.flush === 'function') res.flush();
  };

  req.on('close', () => {
    closed = true;
  });

  try {
    await orchestratorService.runSimulationStream(idea, { provider, apiKey }, sendEvent);
  } catch (error) {
    sendEvent('error', { message: error.message });
  }

  if (!closed) res.end();
};
