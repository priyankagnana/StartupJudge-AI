import { motion } from 'framer-motion';
import {
  Building2, Code2, Scale, LineChart, Users, PieChart,
  Check, Loader2, Clock
} from 'lucide-react';

const AGENTS = [
  { id: 'CFO', icon: Building2, name: 'Priya', role: 'CFO', color: '#22c55e' },
  { id: 'CTO', icon: Code2, name: 'Arjun', role: 'CTO', color: '#3b82f6' },
  { id: 'Legal', icon: Scale, name: 'Sarah', role: 'Legal', color: '#f59e0b' },
  { id: 'Marketing', icon: LineChart, name: 'Rahul', role: 'Marketing', color: '#a855f7' },
  { id: 'HR', icon: Users, name: 'Meera', role: 'HR', color: '#ec4899' },
  { id: 'Market Research', icon: PieChart, name: 'Vikram', role: 'Research', color: '#06b6d4' },
];

const AgentStatusList = ({ statuses, completedCount }) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Agents
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {completedCount}/12 tasks
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '3px',
        background: 'var(--panel-border)',
        borderRadius: '2px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / 13) * 100}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {AGENTS.map(agent => {
          const status = statuses[agent.id] || 'waiting';
          const Icon = agent.icon;

          return (
            <div key={agent.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: status === 'analyzing' ? `${agent.color}06` : 'transparent',
              transition: 'background 0.2s',
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: `${agent.color}12`,
                color: agent.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: status === 'waiting' ? 'var(--text-muted)' : 'var(--text-main)',
                }}>
                  {agent.name}
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  marginLeft: '6px',
                }}>
                  {agent.role}
                </span>
              </div>
              <div>
                {status === 'complete' && <Check size={14} color="var(--success)" />}
                {status === 'analyzing' && <Loader2 size={14} color={agent.color} style={{ animation: 'spin 1s linear infinite' }} />}
                {status === 'waiting' && <Clock size={14} color="var(--text-muted)" style={{ opacity: 0.3 }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentStatusList;
