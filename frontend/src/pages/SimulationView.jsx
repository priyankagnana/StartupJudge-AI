import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { simulateIdea } from '../services/api';
import { ArrowLeft, Zap } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import TypingIndicator from '../components/TypingIndicator';
import AgentStatusList from '../components/AgentStatusList';
import DashboardPanel from '../components/DashboardPanel';

const ROLE_ORDER = ['CFO', 'CTO', 'Legal', 'Marketing', 'HR', 'Market Research'];
const MSG_DELAY = 400; // ms between each message appearing

function buildMessageQueue(data) {
  const queue = [];

  queue.push({ id: 'system-start', isSystem: true, content: `Analyzing: "${data.idea}" with 6 expert agents` });
  queue.push({ id: 'round1-header', isSystem: true, content: 'Round 1 — Each expert evaluates independently' });

  for (const role of ROLE_ORDER) {
    const agent = data.agents[role];
    if (!agent) continue;
    queue.push({
      id: `r1-${role}`,
      role,
      round: 1,
      content: agent.round1 || 'No evaluation',
      score: agent.round1Parsed?.score,
      risks: agent.round1Parsed?.risks,
    });
  }

  queue.push({ id: 'round2-header', isSystem: true, content: 'Round 2 — Cross-Examination. Agents critique each other.' });

  for (const role of ROLE_ORDER) {
    const agent = data.agents[role];
    if (!agent) continue;
    queue.push({
      id: `r2-${role}`,
      role,
      round: 2,
      content: agent.round2 || 'No critique',
    });
  }

  queue.push({ id: 'decision-header', isSystem: true, content: 'Final verdict synthesized from all evaluations' });
  queue.push({ id: 'decision', isDecision: true, decisionData: data.finalDecision });

  return queue;
}

function getAgentStatuses(visibleMessages) {
  const statuses = {};
  for (const role of ROLE_ORDER) statuses[role] = 'waiting';

  for (const msg of visibleMessages) {
    if (msg.role && msg.round === 1) statuses[msg.role] = 'complete';
  }
  // If round 2 messages exist, reset then mark complete
  const hasRound2 = visibleMessages.some(m => m.round === 2);
  if (hasRound2) {
    for (const role of ROLE_ORDER) {
      const r2 = visibleMessages.find(m => m.role === role && m.round === 2);
      statuses[role] = r2 ? 'complete' : 'waiting';
    }
  }
  return statuses;
}

function getCurrentPhase(visibleMessages) {
  const hasDecision = visibleMessages.some(m => m.isDecision);
  if (hasDecision) return 'complete';
  const hasRound2 = visibleMessages.some(m => m.round === 2);
  if (hasRound2) return 'round2';
  const hasRound1 = visibleMessages.some(m => m.round === 1);
  if (hasRound1) return 'round1';
  return 'loading';
}

function getNextAgent(messageQueue, visibleCount) {
  const next = messageQueue[visibleCount];
  if (next && next.role) return next.role;
  return null;
}

// Module-level flag survives React 18 StrictMode unmount/remount
let simulationStarted = false;

const SimulationView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [messageQueue, setMessageQueue] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (simulationStarted) return;
    simulationStarted = true;

    const idea = localStorage.getItem('startup_idea');
    if (!idea) { navigate('/'); return; }

    console.log('[Frontend] Starting simulation for:', idea.substring(0, 50));
    simulateIdea(idea)
      .then(result => {
        try {
          console.log('[Frontend] Response received, agents:', result?.agents ? Object.keys(result.agents) : 'none');
          const queue = buildMessageQueue(result);
          console.log('[Frontend] Message queue built:', queue.length, 'messages');
          setData(result);
          setMessageQueue(queue);
          setLoading(false);
        } catch (e) {
          console.error('[Frontend] buildMessageQueue error:', e);
          setError(e.message);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('[Frontend] API Error:', err.message, err.response?.status);
        const msg = err.response?.data?.error || err.message || 'Simulation failed';
        const code = err.response?.data?.code || (err.response?.status === 429 ? 'RATE_LIMIT' : 'SERVER_ERROR');
        setError(msg);
        setErrorCode(code);
        setLoading(false);
      });

    return () => { simulationStarted = false; };

    return () => { cancelled = true; };
  }, [navigate]);

  // Animate messages appearing one by one
  useEffect(() => {
    if (messageQueue.length === 0) return;
    if (visibleCount >= messageQueue.length) return;

    const timer = setTimeout(() => {
      setVisibleCount(c => c + 1);
    }, visibleCount === 0 ? 100 : MSG_DELAY);

    return () => clearTimeout(timer);
  }, [messageQueue, visibleCount]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCount]);

  const visibleMessages = messageQueue.slice(0, visibleCount);
  const phase = loading ? 'loading' : getCurrentPhase(visibleMessages);
  const agentStatuses = getAgentStatuses(visibleMessages);
  const completedTasks = visibleMessages.filter(m => m.role).length;
  const isAnimating = !loading && visibleCount < messageQueue.length;
  const nextAgent = isAnimating ? getNextAgent(messageQueue, visibleCount) : null;
  const finalDecision = data?.finalDecision;
  const showDashboard = visibleMessages.some(m => m.isDecision);

  // Error screen
  if (error) {
    const isRateLimit = errorCode === 'RATE_LIMIT';
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '480px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: isRateLimit ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{isRateLimit ? '⏳' : '⚠️'}</span>
          </div>

          <h2 style={{
            color: isRateLimit ? 'var(--warning)' : 'var(--danger)',
            marginBottom: '12px', fontSize: '1.2rem',
          }}>
            {isRateLimit ? 'Free Quota Exhausted' : 'Simulation Failed'}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
            {error}
          </p>

          {isRateLimit && (
            <div style={{
              padding: '16px', borderRadius: '10px', textAlign: 'left',
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.12)',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                How to fix this:
              </p>
              <ol style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '18px' }}>
                <li>Go back and click <strong>Provider</strong> in the top-right</li>
                <li>Select a different provider (Groq or Gemini)</li>
                <li>Enter your own free API key</li>
                <li>
                  Get a free key at{' '}
                  <a href="https://cloud.cerebras.ai" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                    cloud.cerebras.ai
                  </a>
                  {', '}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                    console.groq.com
                  </a>
                  {' '}or{' '}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                    aistudio.google.com
                  </a>
                </li>
              </ol>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} /> {isRateLimit ? 'Change Provider' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header phase="loading" navigate={navigate} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid var(--panel-border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              6 experts are evaluating your idea...
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px', opacity: 0.6 }}>
              This takes about 5-10 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header phase={phase} navigate={navigate} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat Column */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid var(--panel-border)',
        }}>
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            {visibleMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                round={msg.round}
                content={msg.content}
                score={msg.score}
                risks={msg.risks}
                isSystem={msg.isSystem}
                isDecision={msg.isDecision}
                decisionData={msg.decisionData}
              />
            ))}

            <AnimatePresence>
              {isAnimating && nextAgent && (
                <TypingIndicator key={`typing-${nextAgent}`} role={nextAgent} />
              )}
            </AnimatePresence>

            {isAnimating && !nextAgent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}
              >
                <div style={{
                  width: '20px', height: '20px',
                  border: '2px solid var(--panel-border)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: '320px', flexShrink: 0, overflowY: 'auto',
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px',
        }}>
          <AgentStatusList
            statuses={agentStatuses}
            completedCount={completedTasks}
          />

          {finalDecision?.conflicts?.length > 0 && showDashboard && (
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--warning)' }}>
                Conflicts
              </h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {finalDecision.conflicts.map((c, i) => (
                  <span key={i} style={{
                    fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px',
                    background: 'rgba(234, 179, 8, 0.08)',
                    color: 'var(--warning)',
                    border: '1px solid rgba(234, 179, 8, 0.15)',
                  }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {showDashboard && finalDecision && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px' }}
              >
                <DashboardPanel decision={finalDecision} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Header = ({ phase, navigate }) => (
  <header style={{
    padding: '12px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid var(--panel-border)', flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={() => navigate('/')}
        style={{ background: 'none', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px', display: 'flex' }}
      >
        <ArrowLeft size={18} />
      </button>
      <Zap size={16} color="var(--primary)" />
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>StartupJudge</span>
      <StatusBadge phase={phase} />
    </div>
    {phase === 'complete' && (
      <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
        New Analysis
      </button>
    )}
  </header>
);

const StatusBadge = ({ phase }) => {
  const config = {
    loading: { label: 'Analyzing...', color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
    round1: { label: 'Round 1', color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
    round2: { label: 'Round 2', color: 'var(--warning)', bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.2)' },
    complete: { label: 'Complete', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' },
  }[phase] || { label: phase, color: 'var(--text-muted)', bg: 'var(--bg-card)', border: 'var(--panel-border)' };

  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 500, padding: '3px 10px', borderRadius: '12px',
      background: config.bg, color: config.color, border: `1px solid ${config.border}`,
    }}>
      {config.label}
    </span>
  );
};

export default SimulationView;
