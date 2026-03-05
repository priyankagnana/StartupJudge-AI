import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { simulateIdea } from '../services/api';
import { 
  Building2, 
  Code2, 
  Scale, 
  LineChart, 
  Users, 
  PieChart 
} from 'lucide-react';

const AGENTS = [
  { id: 'CFO', icon: <Building2 />, name: 'CFO', color: '#10b981' },
  { id: 'CTO', icon: <Code2 />, name: 'CTO', color: '#3b82f6' },
  { id: 'Legal', icon: <Scale />, name: 'Legal Advisor', color: '#f59e0b' },
  { id: 'Marketing', icon: <LineChart />, name: 'Marketing Exec', color: '#8b5cf6' },
  { id: 'HR', icon: <Users />, name: 'HR Director', color: '#ec4899' },
  { id: 'Market Research', icon: <PieChart />, name: 'Market Analyst', color: '#06b6d4' }
];

const LoadingScreen = () => {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAgentIndex((prev) => (prev + 1) % AGENTS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div 
        className="glass-panel"
        style={{ padding: '3rem', textAlign: 'center', width: '400px' }}
      >
        <div style={{ marginBottom: '2rem' }}>
           <div className="loader" style={{
              width: '50px',
              height: '50px',
              border: '4px solid var(--panel-border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
           }} />
           <style>{`
             @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
           `}</style>
        </div>
        <div style={{ height: '80px', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAgentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ 
                color: AGENTS[currentAgentIndex].color,
                background: `${AGENTS[currentAgentIndex].color}20`,
                padding: '12px',
                borderRadius: '50%'
              }}>
                {AGENTS[currentAgentIndex].icon}
              </div>
              <h3 style={{ margin: 0 }}>
                {AGENTS[currentAgentIndex].name} analyzing...
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const DebateView = ({ data, onFinish }) => {
  return (
    <div style={{ padding: '2rem', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Simulation Complete</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Review the expert debate</p>
        </div>
        <button className="btn-primary" onClick={onFinish}>
          View Final Decision Dashboard
        </button>
      </header>
      
      <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
        {/* Left Side: Debate */}
        <div className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
            Boardroom Chat
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(data.agents).map((role, i) => {
              const agentDef = AGENTS.find(a => a.id === role) || AGENTS[0];
              const agentData = data.agents[role];
              
              return (
                <motion.div 
                  key={role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  style={{ display: 'flex', gap: '1rem' }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${agentDef.color}20`,
                    color: agentDef.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {agentDef.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{role}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Round 1</span>
                    </div>
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      padding: '12px 16px',
                      borderRadius: '0 12px 12px 12px',
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                      border: '1px solid var(--panel-border)'
                    }}>
                      {agentData.round1.split('\n').map((line, j) => (
                        <p key={j} style={{ margin: '0 0 8px 0' }}>{line}</p>
                      ))}
                    </div>
                    {/* Simplified display for Round 2 */}
                    {agentData.round2 && (
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '12px' }}>
                          <span style={{ fontWeight: 600 }}>{role}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Critique (Round 2)</span>
                        </div>
                    )}
                    {agentData.round2 && (
                        <div style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '12px 16px',
                          borderRadius: '0 12px 12px 12px',
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                          border: '1px solid var(--panel-border)'
                        }}>
                          {agentData.round2.split('\n').map((line, j) => (
                            <p key={j} style={{ margin: '0 0 8px 0' }}>{line}</p>
                          ))}
                        </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live Progress / Conflict Focus */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ marginBottom: '1rem' }}>Active Agents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {AGENTS.map(agent => (
                <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                   <div style={{ color: agent.color }}>{agent.icon}</div>
                   <span>{agent.name}</span>
                   <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
             <h3 style={{ marginBottom: '1rem', color: 'var(--warning)' }}>Conflict Heatmap</h3>
             <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
               Analyzing disagreements across functional domains...
             </p>
             <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
               <span style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>CFO vs Marketing</span>
               <span style={{ padding: '4px 8px', background: 'var(--warning)', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>Tech Feasibility</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimulationView = ({ setSimulationData }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const runSim = async () => {
      const idea = localStorage.getItem('startup_idea');
      if (!idea) {
        navigate('/');
        return;
      }
      try {
        const result = await simulateIdea(idea);
        setData(result);
        setSimulationData(result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.error || 'Simulation failed to run. Check backend logs.';
        setError(errorMsg);
        setLoading(false);
      }
    };
    
    runSim();
  }, [navigate, setSimulationData]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Simulation Error</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <DebateView data={data} onFinish={() => navigate('/dashboard')} />;
};

export default SimulationView;
