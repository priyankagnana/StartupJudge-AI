import { motion } from 'framer-motion';

const TABS = [
  { key: 'round1', label: 'Round 1' },
  { key: 'round2', label: 'Round 2' },
  { key: 'verdict', label: 'Verdict' },
];

const DebateTabs = ({ activeTab, onTabChange, phase, round1Count, round2Count }) => {
  const isTabEnabled = (key) => {
    if (key === 'round1') return true;
    if (key === 'round2') return ['round2', 'deciding', 'complete'].includes(phase);
    if (key === 'verdict') return phase === 'complete';
    return false;
  };

  const getBadge = (key) => {
    if (key === 'round1' && round1Count > 0) return `${round1Count}/6`;
    if (key === 'round2' && round2Count > 0) return `${round2Count}/6`;
    if (key === 'verdict' && phase === 'complete') return null;
    return null;
  };

  return (
    <div style={{
      display: 'flex', gap: '0',
      flexShrink: 0, position: 'relative', flex: 1,
    }} className="px-3 sm:px-6">
      {TABS.map(tab => {
        const enabled = isTabEnabled(tab.key);
        const active = activeTab === tab.key;
        const badge = getBadge(tab.key);

        return (
          <button
            key={tab.key}
            onClick={() => enabled && onTabChange(tab.key)}
            disabled={!enabled}
            style={{
              padding: '12px 10px', fontSize: '0.8rem', fontWeight: 500,
              background: 'none', cursor: enabled ? 'pointer' : 'not-allowed',
              color: active ? 'var(--primary)' : enabled ? 'var(--text-secondary)' : 'var(--text-muted)',
              opacity: enabled ? 1 : 0.4,
              position: 'relative', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            {tab.label}
            {badge && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                background: active ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)',
                color: active ? 'var(--primary)' : 'var(--text-muted)',
                padding: '1px 6px', borderRadius: '8px',
                border: `1px solid ${active ? 'rgba(245, 158, 11, 0.2)' : 'var(--panel-border)'}`,
              }}>
                {badge}
              </span>
            )}
            {active && (
              <motion.div
                layoutId="tab-indicator"
                style={{
                  position: 'absolute', bottom: '-1px', left: 0, right: 0,
                  height: '2px', background: 'var(--primary)', borderRadius: '1px 1px 0 0',
                }}
                transition={{ duration: 0.25 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DebateTabs;
