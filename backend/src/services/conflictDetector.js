// src/services/conflictDetector.js

const ROLE_TO_DOMAIN = {
  CFO: 'financial',
  CTO: 'technical',
  Legal: 'legal',
  Marketing: 'market',
  HR: 'talent',
  'Market Research': 'competition',
};

class ConflictDetector {
  detectConflicts(agentResults) {
    const conflicts = [];
    const roles = Object.keys(agentResults);

    // Compare Round 1 scores across agents — flag when >30 points apart
    for (let i = 0; i < roles.length; i++) {
      for (let j = i + 1; j < roles.length; j++) {
        const roleA = roles[i];
        const roleB = roles[j];
        const scoreA = agentResults[roleA].round1Parsed?.score;
        const scoreB = agentResults[roleB].round1Parsed?.score;

        if (typeof scoreA === 'number' && typeof scoreB === 'number') {
          const diff = Math.abs(scoreA - scoreB);
          if (diff > 30) {
            const optimist = scoreA > scoreB ? roleA : roleB;
            const pessimist = scoreA > scoreB ? roleB : roleA;
            conflicts.push(`${pessimist} vs ${optimist} (${diff}pt gap)`);
          }
        }
      }
    }

    // Extract explicit disagreements from Round 2 critique JSON
    for (const role of roles) {
      const critique = agentResults[role].round2Parsed;
      if (critique?.disagreements && Array.isArray(critique.disagreements)) {
        for (const d of critique.disagreements) {
          if (typeof d === 'string' && !conflicts.includes(d)) {
            conflicts.push(d);
          }
        }
      }
    }

    // Compute disagreement index from score variance
    const scores = roles
      .map(r => agentResults[r].round1Parsed?.score)
      .filter(s => typeof s === 'number');

    let disagreementIndex = 0;
    if (scores.length >= 2) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      // Normalize: stdDev of 0 = 0%, stdDev of 35+ = 100%
      disagreementIndex = Math.min(100, Math.round((stdDev / 35) * 100));
    }

    return { conflicts, disagreementIndex };
  }
}

module.exports = new ConflictDetector();
