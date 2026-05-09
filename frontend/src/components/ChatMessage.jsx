import { motion } from 'framer-motion';

const AGENT_CONFIG = {
  CFO: { color: '#22c55e', name: 'Priya Sharma', label: 'CFO' },
  CTO: { color: '#3b82f6', name: 'Arjun Mehta', label: 'CTO' },
  Legal: { color: '#f59e0b', name: 'Kavita Iyer', label: 'Legal' },
  Marketing: { color: '#a855f7', name: 'Rahul Kapoor', label: 'Marketing' },
  HR: { color: '#ec4899', name: 'Meera Patel', label: 'HR' },
  'Market Research': { color: '#06b6d4', name: 'Vikram Rao', label: 'Market Research' },
};

const ChatMessage = ({ role, round, content, score, risks, isSystem, isDecision, decisionData }) => {
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '12px 16px',
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}
      >
        {content}
      </motion.div>
    );
  }

  if (isDecision && decisionData) {
    const d = decisionData;
    let decisionColor = 'var(--warning)';
    if (d.decision === 'GO') decisionColor = 'var(--success)';
    if (d.decision === 'NO-GO') decisionColor = 'var(--danger)';

    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          padding: '24px',
          background: `${decisionColor}08`,
          border: `1px solid ${decisionColor}25`,
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
          }}>
            Final Verdict
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <span style={{
            background: `${decisionColor}18`,
            color: decisionColor,
            padding: '8px 20px',
            borderRadius: '6px',
            fontSize: '1.3rem',
            fontWeight: 700,
            border: `1px solid ${decisionColor}30`,
          }}>
            {d.decision}
          </span>
          <span style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: decisionColor,
          }}>
            {d.score}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
          </span>
          {d.confidenceLevel && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid var(--panel-border)',
            }}>
              {d.confidenceLevel} confidence
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {d.summary}
        </p>
      </motion.div>
    );
  }

  const config = AGENT_CONFIG[role] || { color: '#6b7280', name: role, label: role };
  const initial = (config.name || role).charAt(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', gap: '12px' }}
    >
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: `${config.color}15`,
        color: config.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.8rem',
        flexShrink: 0,
        marginTop: '2px',
      }}>
        {initial}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{config.name}</span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'var(--bg-card)',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid var(--panel-border)',
          }}>
            {config.label}
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 500,
            color: config.color,
            background: `${config.color}10`,
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {round === 1 ? 'Evaluation' : 'Critique'}
          </span>
          {typeof score === 'number' && (
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: score >= 60 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)',
              marginLeft: 'auto',
            }}>
              {score}/100
            </span>
          )}
        </div>

        {/* Message body */}
        <div className="chat-bubble">
          {content.split('\n').filter(l => l.trim()).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        {/* Risk tags */}
        {risks && risks.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {risks.map((risk, i) => (
              <span key={i} style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
              }}>
                {risk}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
