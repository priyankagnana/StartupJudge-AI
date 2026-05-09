import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import DashboardPanel from './DashboardPanel';
import RefinePanel from './RefinePanel';

const VerdictTab = ({ decision, conflicts, idea, onRefine }) => {
  if (!decision) return null;

  return (
    <div className="px-3 py-4 sm:p-6" style={{
      flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: '20px',
    }}>
      <ChatMessage
        isDecision
        decisionData={decision}
      />

      {conflicts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', color: 'var(--warning)' }}>
            Key Disagreements
          </h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {conflicts.map((c, i) => (
              <span key={i} style={{
                fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px',
                background: 'rgba(234, 179, 8, 0.08)',
                color: 'var(--warning)',
                border: '1px solid rgba(234, 179, 8, 0.15)',
              }}>{c}</span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '24px' }}
      >
        <DashboardPanel decision={decision} />
      </motion.div>

      {onRefine && (
        <RefinePanel idea={idea} onRefine={onRefine} />
      )}
    </div>
  );
};

export default VerdictTab;
