import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PanelLeftClose, PanelLeft, Trash2, Loader2 } from 'lucide-react';
import { useSimulations } from '../context/SimulationContext';

const VERDICT_COLORS = {
  GO: 'var(--success)',
  'NO-GO': 'var(--danger)',
  PIVOT: 'var(--warning)',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const HistorySidebar = ({ open, onToggle, isMobile, onClose }) => {
  const { simulations, loaded, fetchSimulations, removeSimulation, currentSimulationId } = useSimulations();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) fetchSimulations();
  }, [loaded, fetchSimulations]);

  const handleNavigation = (path, opts) => {
    navigate(path, opts);
    if (isMobile) onClose();
  };

  if (!open) {
    if (isMobile) return null;
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', left: '8px', top: '72px', zIndex: 10,
          background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
          borderRadius: '8px', padding: '8px', cursor: 'pointer',
          color: 'var(--text-muted)', display: 'flex',
        }}
      >
        <PanelLeft size={16} />
      </button>
    );
  }

  const sidebarContent = (
    <div style={{
      width: isMobile ? '280px' : '260px', flexShrink: 0, borderRight: isMobile ? 'none' : '1px solid var(--panel-border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: 'var(--bg-color)', height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)',
      }}>
        <button
          onClick={() => { localStorage.removeItem('startup_idea'); handleNavigation('/simulate', { state: { reset: Date.now() } }); }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', padding: '8px', borderRadius: '8px', fontSize: '0.8rem',
            fontWeight: 600, background: 'var(--primary)', color: 'white', cursor: 'pointer',
          }}
        >
          <Plus size={14} /> New Simulation
        </button>
        <button
          onClick={onToggle}
          style={{
            background: 'none', color: 'var(--text-muted)', padding: '6px',
            marginLeft: '8px', cursor: 'pointer',
          }}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {!loaded && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <Loader2 size={16} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {loaded && simulations.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
            No simulations yet
          </p>
        )}

        <AnimatePresence>
          {simulations.map(sim => {
            const isActive = sim._id === currentSimulationId;
            const verdictColor = VERDICT_COLORS[sim.verdict] || 'var(--text-muted)';

            return (
              <motion.div
                key={sim._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                style={{
                  padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                  cursor: 'pointer', transition: 'background 0.15s',
                  background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  border: isActive ? '1px solid var(--panel-border)' : '1px solid transparent',
                }}
                onClick={() => handleNavigation(`/simulate/${sim._id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{
                    fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 500,
                    lineHeight: 1.4, flex: 1, marginRight: '8px',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {sim.idea}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSimulation(sim._id); }}
                    style={{
                      background: 'none', color: 'var(--text-muted)', padding: '2px',
                      opacity: 0.4, cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  {sim.verdict ? (
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px',
                      borderRadius: '3px', color: verdictColor,
                      background: `${verdictColor}15`, border: `1px solid ${verdictColor}25`,
                    }}>
                      {sim.verdict}
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 500, padding: '1px 6px',
                      borderRadius: '3px', color: 'var(--text-muted)',
                      background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
                    }}>
                      {sim.status === 'failed' ? 'Failed' : 'In progress'}
                    </span>
                  )}
                  {sim.score != null && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {sim.score}/100
                    </span>
                  )}
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {timeAgo(sim.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
          }}
        />
        <div style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
          boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
        }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
};

export default HistorySidebar;
