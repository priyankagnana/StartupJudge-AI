import { motion } from 'framer-motion';

const AGENT_CONFIG = {
  CFO: { color: '#22c55e', name: 'Priya Sharma' },
  CTO: { color: '#3b82f6', name: 'Arjun Mehta' },
  Legal: { color: '#f59e0b', name: 'Sarah Chen' },
  Marketing: { color: '#a855f7', name: 'Rahul Kapoor' },
  HR: { color: '#ec4899', name: 'Meera Patel' },
  'Market Research': { color: '#06b6d4', name: 'Vikram Rao' },
};

const TypingIndicator = ({ role }) => {
  const config = AGENT_CONFIG[role] || { color: '#6b7280', name: role };
  const displayName = config.name || role;
  const initial = displayName.charAt(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', gap: '12px' }}
    >
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
        animation: 'pulse-ring 2s infinite',
      }}>
        {initial}
      </div>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '6px' }}>
          {displayName} is analyzing...
        </div>
        <div className="chat-bubble" style={{ display: 'inline-block' }}>
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
