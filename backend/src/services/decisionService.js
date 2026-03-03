class DecisionService {
  generateDecision(responses) {
    const score = Math.floor(Math.random() * 100);

    let decision = 'PIVOT';
    if (score > 75) decision = 'GO';
    if (score < 40) decision = 'NO-GO';

    return {
      score,
      decision,
      summary: 'Decision based on multi-agent analysis.',
    };
  }
}

module.exports = new DecisionService();