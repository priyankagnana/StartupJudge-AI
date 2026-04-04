// src/services/decisionService.js

const { generateResponse } = require('../utils/aiClient');
const riskScorer = require('./riskScorer');
const conflictDetector = require('./conflictDetector');

function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1].trim()); } catch { /* fall through */ }
    }
    // Try finding JSON object in text
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

class DecisionService {
  async generateDecision(agentResults, providerOptions = {}) {
    // Compute algorithmic scores from agent data
    const { domainScores, feasibilityScore } = riskScorer.computeWeightedScore(agentResults);
    const { conflicts, disagreementIndex } = conflictDetector.detectConflicts(agentResults);

    // Build compact context for AI synthesis
    const agentSummaries = Object.entries(agentResults).map(([role, data]) => {
      const r1 = data.round1Parsed;
      const r2 = data.round2Parsed;
      return `${role}: Score ${r1?.score ?? 'N/A'}/100. ${r1?.assessment ?? ''} Risks: ${(r1?.risks ?? []).join(', ')}. Critique: ${r2?.critique ?? ''}`;
    }).join('\n');

    const prompt = `You are the board chairperson synthesizing a final startup verdict. You've heard 6 experts debate. Now deliver a decisive, specific judgment — not a wishy-washy hedge.

Algorithmic feasibility score: ${feasibilityScore}/100
Domain scores: ${JSON.stringify(domainScores)}
Key conflicts: ${conflicts.join('; ') || 'None'}
Expert disagreement level: ${disagreementIndex}/100

Expert evaluations and critiques:
${agentSummaries}

DECISION RULES:
- GO (75+): Strong fundamentals, manageable risks, clear path to revenue
- PIVOT (40-74): Good core idea but needs significant changes — specify WHAT to pivot
- NO-GO (<40): Fatal flaws that can't be fixed with pivoting
- Summary must be blunt and specific — "This will fail because X" or "This works if you do X first"
- Suggestions must be concrete next steps (not generic advice like "do more research"), e.g. "Build a Chrome extension MVP in 4 weeks targeting GATE exam students"
- topConcern should name the single biggest thing that could kill this startup
- Conflicts should name which experts disagreed and on what specific point

Return ONLY valid JSON:
{
  "feasibilityScore": <0-100>,
  "decision": "<GO|PIVOT|NO-GO>",
  "confidenceLevel": "<HIGH|MEDIUM|LOW>",
  "summary": "<2-3 sentence blunt synthesis — be specific about what works and what doesn't>",
  "domainScores": {"financial": <0-100>, "technical": <0-100>, "legal": <0-100>, "market": <0-100>, "talent": <0-100>, "competition": <0-100>},
  "disagreementIndex": <0-100>,
  "topConcern": {"domain": "<domain name>", "detail": "<specific killer risk in 1-2 sentences>"},
  "suggestions": ["<specific actionable step 1>", "<specific actionable step 2>", "<specific actionable step 3>"],
  "conflicts": ["<Expert A vs Expert B: specific point of disagreement>"]
}`;

    try {
      const raw = await generateResponse(prompt, { ...providerOptions, maxTokens: 600 });
      const parsed = parseJSON(raw);

      if (parsed) {
        // Merge algorithmic scores with AI synthesis
        return {
          score: parsed.feasibilityScore ?? feasibilityScore,
          decision: parsed.decision || (feasibilityScore > 75 ? 'GO' : feasibilityScore < 40 ? 'NO-GO' : 'PIVOT'),
          confidenceLevel: parsed.confidenceLevel || 'MEDIUM',
          summary: parsed.summary || 'Decision based on multi-agent analysis.',
          domainScores: parsed.domainScores || domainScores,
          disagreementIndex: parsed.disagreementIndex ?? disagreementIndex,
          topConcern: parsed.topConcern || { domain: 'unknown', detail: 'Unable to determine top concern.' },
          suggestions: parsed.suggestions || [],
          conflicts: parsed.conflicts || conflicts,
        };
      }
    } catch (error) {
      console.error('Decision AI call failed, using algorithmic fallback:', error.message);
    }

    // Fallback to pure algorithmic scoring if AI call fails
    let decision = 'PIVOT';
    if (feasibilityScore > 75) decision = 'GO';
    if (feasibilityScore < 40) decision = 'NO-GO';

    return {
      score: feasibilityScore,
      decision,
      confidenceLevel: 'LOW',
      summary: 'Decision based on algorithmic scoring (AI synthesis unavailable).',
      domainScores,
      disagreementIndex,
      topConcern: { domain: 'unknown', detail: 'AI synthesis failed — review agent reports manually.' },
      suggestions: [],
      conflicts,
    };
  }
}

module.exports = new DecisionService();
