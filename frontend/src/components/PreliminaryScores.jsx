import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const AGENT_COLORS = {
  CFO: '#22c55e',
  CTO: '#3b82f6',
  Legal: '#f59e0b',
  Marketing: '#a855f7',
  HR: '#ec4899',
  'Market Research': '#06b6d4',
};

const AGENT_NAMES = {
  CFO: 'Priya',
  CTO: 'Arjun',
  Legal: 'Kavita',
  Marketing: 'Rahul',
  HR: 'Meera',
  'Market Research': 'Vikram',
};

const PreliminaryScores = ({ round1Data }) => {
  if (!round1Data) return null;

  const entries = Object.entries(round1Data)
    .filter(([, data]) => typeof data?.score === 'number')
    .sort((a, b) => b[1].score - a[1].score);

  if (entries.length === 0) return null;

  const avg = Math.round(entries.reduce((sum, [, d]) => sum + d.score, 0) / entries.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <BarChart3 size={14} color="var(--primary)" />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Preliminary Scores</span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '16px', gap: '8px',
      }}>
        <span style={{
          fontSize: '2rem', fontWeight: 700,
          color: avg >= 60 ? 'var(--success)' : avg >= 40 ? 'var(--warning)' : 'var(--danger)',
        }}>
          {avg}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100 avg</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {entries.map(([role, data], i) => (
          <div key={role}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {AGENT_NAMES[role] || role}
              </span>
              <span style={{
                fontSize: '0.72rem', fontWeight: 600,
                color: AGENT_COLORS[role] || 'var(--text-muted)',
              }}>
                {data.score}
              </span>
            </div>
            <div style={{
              width: '100%', height: '3px', background: 'var(--panel-border)',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.score}%` }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.06 }}
                style={{
                  height: '100%', borderRadius: '2px',
                  background: AGENT_COLORS[role] || 'var(--primary)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p style={{
        fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '12px',
        fontStyle: 'italic', textAlign: 'center',
      }}>
        Preliminary — may change after cross-examination
      </p>
    </motion.div>
  );
};

export default PreliminaryScores;
