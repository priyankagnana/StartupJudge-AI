// src/services/orchestratorService.js

const agentFactory = require('../agents/agentFactory');
const MemoryService = require('./memoryService');
const decisionService = require('./decisionService');
const cacheService = require('./cacheService');
const { generateResponse } = require('../utils/aiClient');

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1].trim()); } catch { /* fall through */ }
    }
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

// Agent personas — detailed background + personality + focus areas
const AGENT_PERSONAS = {
  CFO: `CFO — Priya Sharma, 15 years in startup finance, ex-Goldman Sachs analyst turned startup CFO. Funded 3 startups through Series B. She's the "show me the numbers" person — skeptical of hype, obsessed with unit economics, and will kill any idea that can't show a path to profitability within 18 months. She speaks in hard numbers and comparisons to known business models.
  MUST EVALUATE: unit economics (CAC vs LTV with estimates), revenue model viability, burn rate vs runway, funding requirements and dilution, path to profitability timeline. Give specific dollar estimates or ratios where possible.`,

  CTO: `CTO — Arjun Mehta, 12 years building scalable systems, ex-senior engineer at Google and early engineer at a YC startup that scaled to 10M users. He thinks in systems, APIs, and architecture diagrams. He's optimistic about what tech CAN do but brutally honest about build timelines — he's seen too many founders underestimate by 3x. He names specific technologies and gives realistic MVP timelines.
  MUST EVALUATE: technical architecture needed (name specific tech stack), third-party API dependencies and their real limits, MVP build complexity (in weeks), scalability bottlenecks, build-vs-buy decisions. Be specific about technologies, frameworks, and infrastructure.`,

  Legal: `Legal Advisor — Sarah Chen, 10 years in tech law, partner at a firm specializing in startup compliance. She's seen startups get sued, shut down by regulators, and lose everything to ToS violations. She's cautious by nature and will always flag the worst-case scenario. She names specific laws, regulations, and precedent cases.
  MUST EVALUATE: specific regulations (COPPA, GDPR, DMCA, platform ToS by name), IP and copyright risks, licensing requirements, data privacy obligations, platform dependency risks. Reference specific legal precedents or real enforcement actions where relevant.`,

  Marketing: `Marketing Strategist — Rahul Kapoor, 8 years in growth marketing, scaled two D2C startups from 0 to 500K users. He's the most bullish person in the room — he sees opportunity everywhere. But he's not naive — he knows exactly which channels work at which stage and how much they cost. He thinks in funnels, cohorts, and viral coefficients. He names specific marketing channels and tactics.
  MUST EVALUATE: specific target user persona (age, behavior, pain point), go-to-market channels with estimated costs (e.g. "Instagram Reels targeting 18-24 students, ~$2 CPM"), competitive positioning, viral/growth mechanics, pricing strategy with specific tiers. Be actionable and specific.`,

  HR: `HR/Talent Advisor — Meera Patel, 9 years in talent acquisition for tech startups, built teams from 3 to 150 people. She's practical and no-nonsense — she knows exactly what roles cost, how hard they are to hire, and where founders overestimate their own abilities. She names specific job titles, salary ranges, and hiring timelines.
  MUST EVALUATE: specific roles needed for MVP (job titles + seniority), realistic hiring timeline, salary expectations in the market, founder skill gaps that need covering, remote vs on-site trade-offs, advisor/mentor needs. Name specific roles like "Senior Full-Stack Engineer ($120-160K)" not just "developers."`,

  'Market Research': `Market Research Analyst — Vikram Rao, 11 years in market intelligence, ex-McKinsey consultant who now advises startups on market entry. He's the data person — he doesn't have opinions, he has data. He'll name competitors, quote market sizes, and reference real reports. He's skeptical of "no competition" claims and will always find who else is doing something similar.
  MUST EVALUATE: name 2-3 real direct/indirect competitors with their strengths and weaknesses, total addressable market (TAM) with rough $ sizing, market timing analysis (why now, not 2 years ago?), underserved user segments, switching costs, entry barriers. Use specific company names and market data.`,
};

const ROLE_NAMES = Object.keys(AGENT_PERSONAS);

// Build Round 1 mega-prompt — all 6 agents evaluate in one call
function buildRound1Prompt(idea) {
  const personaList = Object.entries(AGENT_PERSONAS)
    .map(([role, persona]) => `### ${role}\n${persona}`)
    .join('\n\n');

  return `You are simulating a startup boardroom with 6 domain experts. Each has a distinct background, personality, and communication style. They must deeply analyze this specific idea — reference concrete details from the description, name real technologies/companies/regulations, and give specific assessments (not generic advice that could apply to any startup).

Startup Idea: "${idea}"

THE BOARDROOM PANEL:

${personaList}

CRITICAL RULES:
- Each assessment must reference specific aspects of THIS idea, not generic startup advice
- Name real companies, technologies, regulations, or market data where relevant
- Scores should reflect genuine risk: 90+ means almost no risk, below 40 means serious red flags
- Risks must be specific and actionable, not vague ("YouTube API quota limits at 10,000 units/day" not "API limitations")

Return ONLY valid JSON:
{
  "CFO": {"assessment": "<3-4 sentences with specific analysis>", "score": <0-100>, "risks": ["<specific risk>", "<specific risk>"], "recommendation": "<1 actionable sentence>"},
  "CTO": {"assessment": "<3-4 sentences with specific analysis>", "score": <0-100>, "risks": ["<specific risk>", "<specific risk>"], "recommendation": "<1 actionable sentence>"},
  "Legal": {"assessment": "<3-4 sentences with specific analysis>", "score": <0-100>, "risks": ["<specific risk>", "<specific risk>"], "recommendation": "<1 actionable sentence>"},
  "Marketing": {"assessment": "<3-4 sentences with specific analysis>", "score": <0-100>, "risks": ["<specific risk>", "<specific risk>"], "recommendation": "<1 actionable sentence>"},
  "HR": {"assessment": "<3-4 sentences with specific analysis>", "score": <0-100>, "risks": ["<specific risk>", "<specific risk>"], "recommendation": "<1 actionable sentence>"},
  "Market Research": {"assessment": "<3-4 sentences with specific analysis>", "score": <0-100>, "risks": ["<specific risk>", "<specific risk>"], "recommendation": "<1 actionable sentence>"}
}`;
}

// Build Round 2 mega-prompt — all 6 agents critique in one call
function buildRound2Prompt(idea, round1Summary) {
  return `You are simulating a heated boardroom debate among 6 experts who have STRONG personalities and disagree with each other. They've just heard each other's Round 1 evaluations and now they push back hard.

Startup Idea: "${idea}"

EXPERT PERSONALITIES (stay in character):
- Priya (CFO): Skeptical, numbers-obsessed. She'll challenge anyone who doesn't show financial viability. Talks in CAC, LTV, burn rate.
- Arjun (CTO): Optimistic about tech but realistic about timelines. He'll call out anyone who underestimates build complexity. Talks in tech stack, APIs, sprints.
- Sarah (Legal): Cautious, worst-case thinker. She'll flag risks everyone else is ignoring. Talks in regulations, ToS, precedent.
- Rahul (Marketing): Bullish, opportunity-focused. He'll push back on pessimists and argue for market potential. Talks in channels, funnels, viral loops.
- Meera (HR): Practical, grounded. She'll reality-check hiring plans and challenge unrealistic team assumptions. Talks in roles, salaries, timelines.
- Vikram (Market Research): Data-driven, neutral. He'll counter opinions with competitor data and market numbers. Talks in TAM, competitors, trends.

Round 1 Evaluations:
${round1Summary}

DEBATE RULES:
- Each expert must directly reference and challenge specific claims from Round 1 (e.g. "Arjun scored this 80/100 but ignored the YouTube API rate limits")
- Don't just say "X didn't consider Y" — say "X is wrong about Y because Z" or "X's score of N is too high/low because..."
- Agreements must be specific too — "I back Priya's point about CAC being $15+ because..."
- Each expert should sound DIFFERENT — their personality must come through in how they argue

Return ONLY valid JSON:
{
  "CFO": {"critique": "<3-4 sentences directly challenging other experts with specific rebuttals>", "agreements": ["<specific agreement with named expert>"], "disagreements": ["<specific disagreement: 'Expert X is wrong about Y because Z'>"]},
  "CTO": {"critique": "<3-4 sentences>", "agreements": ["<specific>"], "disagreements": ["<specific>"]},
  "Legal": {"critique": "<3-4 sentences>", "agreements": ["<specific>"], "disagreements": ["<specific>"]},
  "Marketing": {"critique": "<3-4 sentences>", "agreements": ["<specific>"], "disagreements": ["<specific>"]},
  "HR": {"critique": "<3-4 sentences>", "agreements": ["<specific>"], "disagreements": ["<specific>"]},
  "Market Research": {"critique": "<3-4 sentences>", "agreements": ["<specific>"], "disagreements": ["<specific>"]}
}`;
}

// Process batched round results into individual agent results
function processRound1(parsed, memory) {
  const results = {};
  for (const role of ROLE_NAMES) { // eslint-disable-line
    const agentData = parsed[role] || null;
    if (agentData) {
      memory.save(role, 1, JSON.stringify(agentData), agentData);
      results[role] = { round1: agentData.assessment || '', round1Parsed: agentData };
    } else {
      results[role] = { round1: 'No evaluation generated', round1Parsed: null };
    }
  }
  return results;
}

function processRound2(parsed, results, memory) {
  for (const role of ROLE_NAMES) {
    const agentData = parsed[role] || null;
    if (agentData && results[role]) {
      memory.save(role, 2, JSON.stringify(agentData), agentData);
      results[role].round2 = agentData.critique || '';
      results[role].round2Parsed = agentData;
    } else if (results[role]) {
      results[role].round2 = 'No critique generated';
      results[role].round2Parsed = null;
    }
  }
}

// ========== Batch mode — returns full result ==========
exports.runSimulation = async (idea, options = {}) => {
  const { provider, apiKey } = options;
  const providerName = provider || process.env.DEFAULT_PROVIDER || 'groq';
  const providerOptions = { provider: providerName, apiKey };

  if (!apiKey) {
    const cached = cacheService.get(idea, providerName);
    if (cached) {
      console.log('[Cache] Hit — returning cached simulation');
      return cached;
    }
  }

  const memory = new MemoryService();

  // Round 1 — ONE API call for all 6 agents
  console.log('[Round 1] Calling AI for all 6 agent evaluations...');
  const round1Raw = await generateResponse(buildRound1Prompt(idea), { ...providerOptions, maxTokens: 3000 });
  console.log('[Round 1] Raw response (first 500 chars):', round1Raw.substring(0, 500));
  const round1Parsed = parseJSON(round1Raw);
  let results;
  if (round1Parsed) {
    results = processRound1(round1Parsed, memory);
  } else {
    console.warn('[Round 1] JSON parse failed — using raw text fallback');
    results = {};
    for (const role of ROLE_NAMES) {
      results[role] = { round1: round1Raw.substring(0, 300), round1Parsed: { assessment: 'Parse error — raw response used', score: 50, risks: [], recommendation: '' } };
    }
  }
  console.log('[Round 1] Complete');

  // Brief pause to avoid back-to-back rate limit hits
  await new Promise(r => setTimeout(r, 5000));

  // Round 2 — ONE API call for all 6 agent critiques
  const summary = memory.getSummary();
  console.log('[Round 2] Calling AI for all 6 agent critiques...');
  const round2Raw = await generateResponse(buildRound2Prompt(idea, summary), { ...providerOptions, maxTokens: 3000 });
  console.log('[Round 2] Raw response (first 500 chars):', round2Raw.substring(0, 500));
  const round2Parsed = parseJSON(round2Raw);
  if (round2Parsed) {
    processRound2(round2Parsed, results, memory);
  } else {
    console.warn('[Round 2] JSON parse failed — using raw text fallback');
    for (const role of ROLE_NAMES) {
      if (results[role]) {
        results[role].round2 = round2Raw.substring(0, 300);
        results[role].round2Parsed = { critique: 'Parse error — raw response used', agreements: [], disagreements: [] };
      }
    }
  }
  console.log('[Round 2] Complete');

  await new Promise(r => setTimeout(r, 5000));

  // Decision — ONE API call
  console.log('[Decision] Synthesizing final verdict...');
  const finalDecision = await decisionService.generateDecision(results, providerOptions);
  console.log('[Decision] Complete');

  const output = { idea, agents: results, finalDecision };
  console.log('[Output] Agent roles:', Object.keys(results));
  console.log('[Output] Decision:', finalDecision?.decision, 'Score:', finalDecision?.score);
  console.log('[Output] Total response size:', JSON.stringify(output).length, 'chars');
  if (!apiKey) cacheService.set(idea, providerName, output);
  return output;
};

// ========== Stream mode — emits SSE events progressively ==========
exports.runSimulationStream = async (idea, options = {}, onEvent) => {
  const { provider, apiKey } = options;
  const providerName = provider || process.env.DEFAULT_PROVIDER || 'groq';
  const providerOptions = { provider: providerName, apiKey };

  // Check cache
  if (!apiKey) {
    const cached = cacheService.get(idea, providerName);
    if (cached) {
      onEvent('cache_hit', cached);
      return cached;
    }
  }

  const memory = new MemoryService();

  onEvent('simulation_start', {
    idea,
    agents: ROLE_NAMES,
    provider: providerName,
  });

  // Round 1 — ONE API call, then emit individual results
  for (const role of ROLE_NAMES) {
    onEvent('agent_thinking', { role, round: 1 });
  }

  console.log('[Stream Round 1] Calling AI for all 6 evaluations...');
  let results = {};
  try {
    const round1Raw = await generateResponse(buildRound1Prompt(idea), { ...providerOptions, maxTokens: 3000 });
    console.log('[Stream Round 1] Raw (first 500):', round1Raw.substring(0, 500));
    const round1Parsed = parseJSON(round1Raw);

    if (round1Parsed) {
      results = processRound1(round1Parsed, memory);
    } else {
      console.warn('[Stream Round 1] JSON parse failed — using fallback');
      for (const role of ROLE_NAMES) {
        results[role] = { round1: 'Evaluation received (parse error)', round1Parsed: { assessment: 'Evaluation received but JSON parsing failed', score: 50, risks: [], recommendation: '' } };
      }
    }

    for (const role of ROLE_NAMES) {
      const agentData = round1Parsed?.[role];
      onEvent('agent_round1', {
        role,
        assessment: agentData?.assessment || results[role]?.round1 || 'No evaluation',
        score: agentData?.score ?? 50,
        risks: agentData?.risks || [],
        recommendation: agentData?.recommendation || '',
      });
    }
  } catch (error) {
    console.error('[Stream Round 1] Error:', error.message);
    onEvent('error', { message: `Round 1 failed: ${error.message}` });
    return;
  }

  console.log('[Stream Round 1] Complete');
  onEvent('round1_complete', {});

  // Round 2 — ONE API call, then emit individual results
  for (const role of ROLE_NAMES) {
    onEvent('agent_thinking', { role, round: 2 });
  }

  console.log('[Stream Round 2] Calling AI for all 6 critiques...');
  try {
    const summary = memory.getSummary();
    const round2Raw = await generateResponse(buildRound2Prompt(idea, summary), { ...providerOptions, maxTokens: 3000 });
    const round2Parsed = parseJSON(round2Raw);

    if (!round2Parsed) {
      onEvent('error', { message: 'Failed to parse Round 2 AI response' });
      return;
    }

    processRound2(round2Parsed, results, memory);

    for (const role of ROLE_NAMES) {
      const agentData = round2Parsed[role];
      onEvent('agent_round2', {
        role,
        critique: agentData?.critique || 'No critique',
        agreements: agentData?.agreements || [],
        disagreements: agentData?.disagreements || [],
      });
    }
  } catch (error) {
    console.error('[Stream Round 2] Error:', error.message);
    onEvent('error', { message: `Round 2 failed: ${error.message}` });
    return;
  }

  console.log('[Stream Round 2] Complete');
  onEvent('round2_complete', {});

  // Decision — ONE API call
  onEvent('deciding', {});
  console.log('[Stream Decision] Synthesizing...');
  try {
    const finalDecision = await decisionService.generateDecision(results, providerOptions);
    onEvent('decision', finalDecision);
    console.log('[Stream Decision] Complete');

    const output = { idea, agents: results, finalDecision };
    if (!apiKey) cacheService.set(idea, providerName, output);
    onEvent('simulation_complete', output);
    return output;
  } catch (error) {
    console.error('[Stream Decision] Error:', error.message);
    onEvent('error', { message: `Decision failed: ${error.message}` });
  }
};
