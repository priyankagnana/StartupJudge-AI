import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  RefreshCcw,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Gauge
} from 'lucide-react';

const CircularMeter = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'var(--success)';
  if (score < 40) color = 'var(--danger)';
  else if (score < 75) color = 'var(--warning)';

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="var(--panel-border)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
};

function getRiskColor(level) {
  if (level >= 70) return '#f85149';
  if (level >= 40) return '#d29922';
  return '#2ea043';
}

const DOMAIN_LABELS = {
  financial: 'Financial Risk',
  technical: 'Technical Risk',
  legal: 'Legal / Compliance',
  market: 'Market Potential',
  talent: 'Talent Risk',
  competition: 'Competition Intensity',
};

const Dashboard = ({ data }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) {
      navigate('/');
    }
  }, [data, navigate]);

  if (!data) return null;

  const { finalDecision } = data;
  const decision = finalDecision.decision;
  const score = finalDecision.score ?? 50;
  const confidenceLevel = finalDecision.confidenceLevel || 'MEDIUM';
  const summary = finalDecision.summary || 'Decision based on multi-agent analysis.';
  const domainScores = finalDecision.domainScores || {};
  const suggestions = finalDecision.suggestions || [];
  const topConcern = finalDecision.topConcern || null;
  const disagreementIndex = finalDecision.disagreementIndex ?? 0;

  let decisionColor = 'var(--warning)';
  if (decision === 'GO') decisionColor = 'var(--success)';
  if (decision === 'NO-GO') decisionColor = 'var(--danger)';

  let confidenceColor = 'var(--warning)';
  if (confidenceLevel === 'HIGH') confidenceColor = 'var(--success)';
  if (confidenceLevel === 'LOW') confidenceColor = 'var(--danger)';

  // Build risk categories from real domain scores
  const riskCategories = Object.entries(domainScores).map(([domain, level]) => ({
    name: DOMAIN_LABELS[domain] || domain,
    level: typeof level === 'number' ? 100 - level : 50, // Invert: high score = low risk
    color: getRiskColor(typeof level === 'number' ? 100 - level : 50),
  }));

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 4rem', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Boardroom Decision</h1>
          <p style={{ color: 'var(--text-muted)' }}>Analysis complete for: "{data.idea}"</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCcw size={16} /> New Simulation
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', flex: 1 }}>

        {/* Left Column: Final Verdict */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Startup Health Meter</h3>
            <CircularMeter score={score} />
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{
                background: `${decisionColor}20`,
                color: decisionColor,
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1.5rem',
                fontWeight: 700,
                border: `1px solid ${decisionColor}40`
              }}>
                {decision}
              </span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{
                  background: `${confidenceColor}15`,
                  color: confidenceColor,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: `1px solid ${confidenceColor}30`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <Gauge size={12} /> {confidenceLevel} confidence
                </span>
                {disagreementIndex > 0 && (
                  <span style={{
                    background: 'rgba(248, 81, 73, 0.1)',
                    color: 'var(--danger)',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid rgba(248, 81, 73, 0.3)',
                  }}>
                    {disagreementIndex}% disagreement
                  </span>
                )}
              </div>
            </div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {summary}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel"
            style={{ padding: '2rem' }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" />
              Actionable Suggestions
            </h3>
            {suggestions.length > 0 ? (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
                {suggestions.map((suggestion, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                    <CheckCircle size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No suggestions generated.</p>
            )}
          </motion.div>

        </div>

        {/* Right Column: Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel"
            style={{ padding: '2rem', flex: 1 }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
              <ShieldAlert size={20} color="var(--warning)" />
              Risk Breakdown Profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {riskCategories.length > 0 ? riskCategories.map((risk, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span>{risk.name}</span>
                    <span style={{ color: risk.color, fontWeight: 600 }}>{risk.level}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--panel-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${risk.level}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      style={{ height: '100%', background: risk.color, borderRadius: '4px' }}
                    />
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--text-muted)' }}>No risk data available.</p>
              )}
            </div>

            {topConcern && topConcern.domain !== 'unknown' && (
              <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                background: 'rgba(248, 81, 73, 0.05)',
                border: '1px solid rgba(248, 81, 73, 0.2)',
                borderRadius: '8px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'var(--danger)', marginBottom: '4px' }}>
                    Top Concern: {DOMAIN_LABELS[topConcern.domain] || topConcern.domain}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {topConcern.detail}
                  </p>
                </div>
              </div>
            )}

          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
