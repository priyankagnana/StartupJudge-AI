import { motion } from 'framer-motion';
import {
  TrendingUp, ShieldAlert, AlertTriangle, CheckCircle, Gauge
} from 'lucide-react';

const DOMAIN_LABELS = {
  financial: 'Financial Risk',
  technical: 'Technical Risk',
  legal: 'Legal / Compliance',
  market: 'Market Potential',
  talent: 'Talent Risk',
  competition: 'Competition',
};

function getRiskColor(level) {
  if (level >= 70) return '#ef4444';
  if (level >= 40) return '#eab308';
  return '#22c55e';
}

const ScoreMeter = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = 'var(--success)';
  if (score < 40) color = 'var(--danger)';
  else if (score < 75) color = 'var(--warning)';

  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} stroke="var(--panel-border)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="60" cy="60" r={radius}
          stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
};

const DashboardPanel = ({ decision }) => {
  if (!decision) return null;

  const score = decision.score ?? 50;
  const domainScores = decision.domainScores || {};
  const suggestions = decision.suggestions || [];
  const topConcern = decision.topConcern;
  const disagreementIndex = decision.disagreementIndex ?? 0;

  const riskCategories = Object.entries(domainScores).map(([domain, level]) => ({
    name: DOMAIN_LABELS[domain] || domain,
    level: typeof level === 'number' ? 100 - level : 50,
    color: getRiskColor(typeof level === 'number' ? 100 - level : 50),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--panel-border)',
      }}>
        <Gauge size={16} color="var(--primary)" />
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Analysis Dashboard</h3>
        {disagreementIndex > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.7rem',
            fontWeight: 500,
            color: 'var(--danger)',
            background: 'rgba(239, 68, 68, 0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {disagreementIndex}% disagreement
          </span>
        )}
      </div>

      {/* Score */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <ScoreMeter score={score} />
      </div>

      {/* Risk Bars */}
      {riskCategories.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <ShieldAlert size={14} color="var(--warning)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Risk Breakdown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {riskCategories.map((risk, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{risk.name}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: risk.color }}>{risk.level}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--panel-border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.level}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + (i * 0.08) }}
                    style={{ height: '100%', background: risk.color, borderRadius: '2px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Concern */}
      {topConcern && topConcern.domain !== 'unknown' && (
        <div style={{
          padding: '12px',
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.12)',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
        }}>
          <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '2px' }}>
              {DOMAIN_LABELS[topConcern.domain] || topConcern.domain}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {topConcern.detail}
            </p>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <TrendingUp size={14} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Suggestions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                padding: '8px 10px',
                background: 'var(--bg-card)',
                borderRadius: '6px',
              }}>
                <CheckCircle size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardPanel;
