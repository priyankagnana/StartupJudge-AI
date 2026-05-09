import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const RefinePanel = ({ idea, onRefine }) => {
  const [expanded, setExpanded] = useState(false);
  const [refinedIdea, setRefinedIdea] = useState(idea || '');

  const handleRefine = () => {
    if (refinedIdea.trim() && refinedIdea.trim() !== idea?.trim()) {
      onRefine(refinedIdea.trim());
    }
  };

  const hasChanges = refinedIdea.trim() && refinedIdea.trim() !== idea?.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      style={{
        borderTop: '1px solid var(--panel-border)',
        paddingTop: '20px', marginTop: '8px',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
          background: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem',
          fontWeight: 500, cursor: 'pointer', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} />
          Want to refine your idea and re-evaluate?
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: '16px' }}
        >
          <textarea
            value={refinedIdea}
            onChange={(e) => setRefinedIdea(e.target.value)}
            rows={4}
            style={{
              width: '100%', padding: '14px 18px', fontSize: '0.9rem',
              background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
              borderRadius: '10px', color: 'var(--text-main)', outline: 'none',
              resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleRefine}
            disabled={!hasChanges}
            className="btn-primary"
            style={{
              marginTop: '12px', padding: '10px 20px', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px',
              opacity: hasChanges ? 1 : 0.4, cursor: hasChanges ? 'pointer' : 'not-allowed',
            }}
          >
            <RefreshCw size={14} /> Re-evaluate
          </button>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            This will start a new simulation. Your current analysis will be saved in history.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RefinePanel;
