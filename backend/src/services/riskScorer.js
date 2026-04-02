// src/services/riskScorer.js

const DOMAIN_WEIGHTS = {
  financial: 0.20,
  technical: 0.18,
  legal: 0.15,
  market: 0.17,
  talent: 0.13,
  competition: 0.17,
};

const ROLE_TO_DOMAIN = {
  CFO: 'financial',
  CTO: 'technical',
  Legal: 'legal',
  Marketing: 'market',
  HR: 'talent',
  'Market Research': 'competition',
};

class RiskScorer {
  computeWeightedScore(agentResults) {
    const domainScores = {};
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [role, data] of Object.entries(agentResults)) {
      const domain = ROLE_TO_DOMAIN[role];
      if (!domain) continue;

      const parsed = data.round1Parsed;
      if (parsed && typeof parsed.score === 'number') {
        domainScores[domain] = parsed.score;
        const weight = DOMAIN_WEIGHTS[domain] || 0.15;
        weightedSum += parsed.score * weight;
        totalWeight += weight;
      }
    }

    const feasibilityScore = totalWeight > 0
      ? Math.round(weightedSum / totalWeight)
      : 50;

    return { domainScores, feasibilityScore };
  }
}

module.exports = new RiskScorer();
