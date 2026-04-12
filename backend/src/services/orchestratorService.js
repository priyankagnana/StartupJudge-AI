// src/services/orchestratorService.js

const agentFactory = require('../agents/agentFactory');
const MemoryService = require('./memoryService');
const decisionService = require('./decisionService');
const cacheService = require('./cacheService');
const { generateResponse } = require('../utils/aiClient');

function cleanResponse(text) {
  // Strip control characters (DEL, backspace, etc.) that corrupt JSON
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, '');
}

function parseJSON(text) {
  const cleaned = cleanResponse(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try extracting from markdown code blocks
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1].trim()); } catch { /* fall through */ }
    }
    // Try finding the outermost JSON object
    const braceMatch = cleaned.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]); } catch { /* fall through */ }
    }
    // Try truncating at the last complete agent entry (fix for truncated responses)
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0) {
      // Find matching depth — try progressively shorter substrings
      for (let i = lastBrace; i > 0; i--) {
        if (cleaned[i] === '}') {
          const candidate = cleaned.substring(0, i + 1);
          try { return JSON.parse(candidate); } catch { /* try shorter */ }
        }
      }
    }
    return null;
  }
}

// Agent personas — Indian context, INR pricing, Indian market references
const AGENT_PERSONAS = {
  CFO: `CFO — Priya Sharma, 15 years in startup finance, ex-Kotak Investment Banking turned startup CFO. Funded 3 Indian startups through Series B including a Shark Tank India featured brand. She's the "show me the numbers" person — skeptical of hype, obsessed with unit economics, and will kill any idea that can't show a path to profitability within 18 months. She speaks in hard numbers, references Indian market benchmarks, and compares to known Indian business models (Zerodha, Zomato, Razorpay). She uses INR for all estimates.
  MUST EVALUATE: unit economics (CAC vs LTV in INR), revenue model viability in Indian market, burn rate vs runway, funding requirements (seed/pre-seed in Indian context), path to profitability timeline. Give specific INR estimates or ratios. Reference Indian startup benchmarks where possible.`,

  CTO: `CTO — Arjun Mehta, 12 years building scalable systems, ex-senior engineer at Flipkart and early engineer at a YC-backed Indian startup that scaled to 10M users. He thinks in systems, APIs, and architecture diagrams. He's optimistic about what tech CAN do but brutally honest about build timelines — he's seen too many Indian founders underestimate by 3x. He names specific technologies, references Indian infra challenges (Jio network, UPI integration, Aadhaar APIs), and gives realistic MVP timelines.
  MUST EVALUATE: technical architecture needed (name specific tech stack), third-party API dependencies and their real limits (Razorpay, UPI, Aadhaar, Indian cloud pricing), MVP build complexity (in weeks), scalability for Indian user base (Tier 2/3 cities, low bandwidth), build-vs-buy decisions. Be specific about technologies, frameworks, and Indian infrastructure.`,

  Legal: `Legal Advisor — Kavita Iyer, 10 years in Indian tech law, partner at a Bangalore firm specializing in startup compliance. She's seen Indian startups get shut down by RBI, MCA, and DPIIT. She's cautious by nature and will always flag the worst-case scenario. She references specific Indian laws — IT Act, DPDPA 2023, FEMA, Companies Act, GST compliance, FSSAI (for food), RBI guidelines (for fintech).
  MUST EVALUATE: specific Indian regulations (DPDPA 2023, IT Act Section 43A, RBI guidelines, SEBI, FSSAI, state-level licenses), GST implications, startup India registration benefits, data localization requirements, platform dependency risks. Reference specific Indian legal cases or enforcement actions where relevant.`,

  Marketing: `Marketing Strategist — Rahul Kapoor, 8 years in growth marketing in India, scaled two Indian D2C startups from 0 to 5 lakh users. He built growth for brands featured on Shark Tank India. He's the most bullish person in the room — he sees opportunity everywhere. He knows Indian digital marketing costs: Instagram Reels CPM (~₹50-80), Google Ads CPC (~₹15-30), WhatsApp Business costs, and influencer rates on Indian platforms. He thinks in funnels, cohorts, and viral coefficients for Indian audiences.
  MUST EVALUATE: specific Indian target user persona (age, city tier, language, behavior), go-to-market channels with INR costs (e.g. "Instagram Reels targeting 18-24 college students in Tier 2 cities, ~₹60 CPM"), competitive positioning in Indian market, WhatsApp/Telegram growth tactics, pricing strategy in INR for Indian purchasing power. Be actionable and India-specific.`,

  HR: `HR/Talent Advisor — Meera Patel, 9 years in talent acquisition for Indian tech startups in Bangalore and Mumbai, built teams from 3 to 150 people. She's practical and no-nonsense — she knows Indian tech hiring market inside out. She quotes salaries in LPA (lakhs per annum), knows Tier 1 vs Tier 2 city hiring dynamics, and understands the competition from Infosys/TCS/Wipro for freshers and from FAANG for seniors.
  MUST EVALUATE: specific roles needed for MVP (job titles + seniority), realistic hiring timeline in Indian market, salary expectations in LPA (e.g. "Senior Full-Stack Engineer 18-25 LPA in Bangalore"), founder skill gaps, remote vs Bangalore/Mumbai trade-offs, internship/fresher leverage. Name specific roles with Indian salary ranges.`,

  'Market Research': `Market Research Analyst — Vikram Rao, 11 years in market intelligence, ex-Bain India consultant who now advises startups on Indian market entry. He's the data person — he doesn't have opinions, he has data. He references RedSeer, Redseer Moments, Inc42, and Tracxn reports. He names Indian competitors, quotes Indian market sizes, and understands Tier 1/2/3 city dynamics. He's skeptical of "no competition" claims and will always find who else in India is doing something similar.
  MUST EVALUATE: name 2-3 real Indian direct/indirect competitors with their strengths and weaknesses, total addressable market (TAM) in INR with rough sizing, market timing analysis for India (why now?), underserved segments in Tier 2/3 cities, UPI/digital India tailwinds, entry barriers in Indian market. Use specific Indian company names and market data.`,
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
- Kavita (Legal): Cautious, worst-case thinker. She'll flag risks everyone else is ignoring. Talks in Indian regulations — DPDPA, IT Act, RBI, FSSAI, GST.
- Rahul (Marketing): Bullish, opportunity-focused. He'll push back on pessimists and argue for Indian market potential. Talks in channels, funnels, viral loops, WhatsApp growth. Uses INR.
- Meera (HR): Practical, grounded. She'll reality-check hiring plans with Indian market salaries in LPA. Talks in roles, Bangalore/Mumbai hiring, fresher vs senior dynamics.
- Vikram (Market Research): Data-driven, neutral. He'll counter opinions with Indian competitor data, Inc42 reports, and Tracxn numbers. Uses INR for market sizing.

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
    console.warn('[Round 1] JSON parse failed — attempting partial extraction');
    results = {};
    const cleaned = cleanResponse(round1Raw);
    for (const role of ROLE_NAMES) {
      // Try to extract individual agent JSON from the raw response
      const roleRegex = new RegExp(`"${role}"\\s*:\\s*(\\{[^}]*\\})`, 's');
      const roleMatch = cleaned.match(roleRegex);
      if (roleMatch) {
        try {
          const agentData = JSON.parse(roleMatch[1]);
          results[role] = { round1: agentData.assessment || 'Evaluation received', round1Parsed: agentData };
          continue;
        } catch { /* fall through */ }
      }
      results[role] = { round1: 'Evaluation could not be parsed. Please try again.', round1Parsed: { assessment: 'Evaluation could not be parsed', score: 50, risks: [], recommendation: '' } };
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
    console.warn('[Round 2] JSON parse failed — attempting partial extraction');
    const cleaned = cleanResponse(round2Raw);
    for (const role of ROLE_NAMES) {
      if (!results[role]) continue;
      const roleRegex = new RegExp(`"${role}"\\s*:\\s*(\\{[^}]*\\})`, 's');
      const roleMatch = cleaned.match(roleRegex);
      if (roleMatch) {
        try {
          const agentData = JSON.parse(roleMatch[1]);
          results[role].round2 = agentData.critique || 'Critique received';
          results[role].round2Parsed = agentData;
          continue;
        } catch { /* fall through */ }
      }
      results[role].round2 = 'Critique could not be parsed. Please try again.';
      results[role].round2Parsed = { critique: 'Critique could not be parsed', agreements: [], disagreements: [] };
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

// ========== Per-round mode — 3 separate calls from frontend ==========

exports.runRound1 = async (idea, options = {}) => {
  const { provider, apiKey } = options;
  const providerName = provider || process.env.DEFAULT_PROVIDER || 'cerebras';
  const providerOptions = { provider: providerName, apiKey };

  console.log('[Round 1] Calling AI for all 6 agent evaluations...');
  const round1Raw = await generateResponse(buildRound1Prompt(idea), { ...providerOptions, maxTokens: 3000 });
  console.log('[Round 1] Raw response (first 300 chars):', round1Raw.substring(0, 300));
  const round1Parsed = parseJSON(round1Raw);

  const results = {};
  if (round1Parsed) {
    for (const role of ROLE_NAMES) {
      const agentData = round1Parsed[role] || null;
      results[role] = agentData
        ? { assessment: agentData.assessment || '', score: agentData.score, risks: agentData.risks || [], recommendation: agentData.recommendation || '' }
        : { assessment: 'No evaluation generated', score: 50, risks: [], recommendation: '' };
    }
  } else {
    console.warn('[Round 1] JSON parse failed — partial extraction');
    const cleaned = cleanResponse(round1Raw);
    for (const role of ROLE_NAMES) {
      const roleRegex = new RegExp(`"${role}"\\s*:\\s*(\\{[^}]*\\})`, 's');
      const roleMatch = cleaned.match(roleRegex);
      if (roleMatch) {
        try {
          const agentData = JSON.parse(roleMatch[1]);
          results[role] = { assessment: agentData.assessment || '', score: agentData.score || 50, risks: agentData.risks || [], recommendation: agentData.recommendation || '' };
          continue;
        } catch { /* fall through */ }
      }
      results[role] = { assessment: 'Evaluation could not be parsed', score: 50, risks: [], recommendation: '' };
    }
  }
  console.log('[Round 1] Complete');
  return { agents: results };
};

exports.runRound2 = async (idea, round1Agents, options = {}) => {
  const { provider, apiKey } = options;
  const providerName = provider || process.env.DEFAULT_PROVIDER || 'cerebras';
  const providerOptions = { provider: providerName, apiKey };

  // Build summary from Round 1 results
  const summary = ROLE_NAMES.map(role => {
    const a = round1Agents[role];
    return `${role}: Score ${a?.score ?? 'N/A'}/100. ${a?.assessment ?? ''}`;
  }).join('\n');

  console.log('[Round 2] Calling AI for all 6 agent critiques...');
  const round2Raw = await generateResponse(buildRound2Prompt(idea, summary), { ...providerOptions, maxTokens: 3000 });
  console.log('[Round 2] Raw response (first 300 chars):', round2Raw.substring(0, 300));
  const round2Parsed = parseJSON(round2Raw);

  const results = {};
  if (round2Parsed) {
    for (const role of ROLE_NAMES) {
      const agentData = round2Parsed[role] || null;
      results[role] = agentData
        ? { critique: agentData.critique || '', agreements: agentData.agreements || [], disagreements: agentData.disagreements || [] }
        : { critique: 'No critique generated', agreements: [], disagreements: [] };
    }
  } else {
    console.warn('[Round 2] JSON parse failed — partial extraction');
    const cleaned = cleanResponse(round2Raw);
    for (const role of ROLE_NAMES) {
      const roleRegex = new RegExp(`"${role}"\\s*:\\s*(\\{[^}]*\\})`, 's');
      const roleMatch = cleaned.match(roleRegex);
      if (roleMatch) {
        try {
          const agentData = JSON.parse(roleMatch[1]);
          results[role] = { critique: agentData.critique || '', agreements: agentData.agreements || [], disagreements: agentData.disagreements || [] };
          continue;
        } catch { /* fall through */ }
      }
      results[role] = { critique: 'Critique could not be parsed', agreements: [], disagreements: [] };
    }
  }
  console.log('[Round 2] Complete');
  return { agents: results };
};

exports.runDecision = async (idea, round1Agents, round2Agents, options = {}) => {
  const { provider, apiKey } = options;
  const providerName = provider || process.env.DEFAULT_PROVIDER || 'cerebras';
  const providerOptions = { provider: providerName, apiKey };

  // Merge round1 + round2 into the format decisionService expects
  const mergedResults = {};
  for (const role of ROLE_NAMES) {
    mergedResults[role] = {
      round1: round1Agents[role]?.assessment || '',
      round1Parsed: round1Agents[role] || null,
      round2: round2Agents[role]?.critique || '',
      round2Parsed: round2Agents[role] || null,
    };
  }

  console.log('[Decision] Synthesizing final verdict...');
  const finalDecision = await decisionService.generateDecision(mergedResults, providerOptions);
  console.log('[Decision] Complete —', finalDecision?.decision, finalDecision?.score);
  return finalDecision;
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
