import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRound1, fetchRound2, fetchDecision } from '../services/api';
import { ArrowLeft, Zap } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';
import TypingIndicator from '../components/TypingIndicator';
import AgentStatusList from '../components/AgentStatusList';
import DashboardPanel from '../components/DashboardPanel';

const ROLE_ORDER = ['CFO', 'CTO', 'Legal', 'Marketing', 'HR', 'Market Research'];
const MSG_DELAY = 800; // ms between each message appearing

function getAgentStatuses(visibleMessages) {
  const statuses = {};
  for (const role of ROLE_ORDER) statuses[role] = 'waiting';
  for (const msg of visibleMessages) {
    if (msg.role) statuses[msg.role] = 'complete';
  }
  return statuses;
}

function getNextAgent(messages, visibleCount) {
  const next = messages[visibleCount];
  if (next && next.role) return next.role;
  return null;
}

let simulationStarted = false;

const SimulationView = () => {
  const [phase, setPhase] = useState('loading'); // loading | round1 | round2 | deciding | complete | error
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [messages, setMessages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [finalDecision, setFinalDecision] = useState(null);
  const [round1Data, setRound1Data] = useState(null);
  const [round2Data, setRound2Data] = useState(null);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const ideaRef = useRef('');

  const goHome = () => { simulationStarted = false; navigate('/'); };

  // Main simulation flow — 3 sequential API calls with animation between each
  useEffect(() => {
    if (simulationStarted) return;
    simulationStarted = true;

    const idea = localStorage.getItem('startup_idea');
    if (!idea) { simulationStarted = false; navigate('/'); return; }
    ideaRef.current = idea;

    const run = async () => {
      try {
        // System messages
        setMessages([
          { id: 'system-start', isSystem: true, content: `Analyzing: "${idea.substring(0, 100)}${idea.length > 100 ? '...' : ''}" with 6 expert agents` },
          { id: 'round1-header', isSystem: true, content: 'Round 1 — Each expert evaluates independently' },
        ]);
        setVisibleCount(2);
        setPhase('round1');

        // ---- ROUND 1 ----
        console.log('[Frontend] Calling Round 1...');
        const r1 = await fetchRound1(idea);
        console.log('[Frontend] Round 1 received:', Object.keys(r1.agents));
        setRound1Data(r1.agents);

        // Build Round 1 messages
        const r1Messages = ROLE_ORDER.map(role => ({
          id: `r1-${role}`,
          role,
          round: 1,
          content: r1.agents[role]?.assessment || 'No evaluation',
          score: r1.agents[role]?.score,
          risks: r1.agents[role]?.risks,
        }));

        setMessages(prev => [...prev, ...r1Messages]);
        // Messages will animate one by one via the visibleCount effect

        // Wait for Round 1 animation to finish before calling Round 2
        // 6 agents × MSG_DELAY = animation time
        await sleep(ROLE_ORDER.length * MSG_DELAY + 2000);

        // ---- ROUND 2 ----
        setPhase('round2');
        setMessages(prev => [
          ...prev,
          { id: 'round2-header', isSystem: true, content: 'Round 2 — Cross-Examination. Agents critique each other.' },
        ]);

        console.log('[Frontend] Calling Round 2...');
        const r2 = await fetchRound2(idea, r1.agents);
        console.log('[Frontend] Round 2 received:', Object.keys(r2.agents));
        setRound2Data(r2.agents);

        const r2Messages = ROLE_ORDER.map(role => ({
          id: `r2-${role}`,
          role,
          round: 2,
          content: r2.agents[role]?.critique || 'No critique',
        }));

        setMessages(prev => [...prev, ...r2Messages]);

        // Wait for Round 2 animation
        await sleep(ROLE_ORDER.length * MSG_DELAY + 2000);

        // ---- DECISION ----
        setPhase('deciding');
        setMessages(prev => [
          ...prev,
          { id: 'deciding-msg', isSystem: true, content: 'Synthesizing final verdict from all evaluations...' },
        ]);

        console.log('[Frontend] Calling Decision...');
        const decision = await fetchDecision(idea, r1.agents, r2.agents);
        console.log('[Frontend] Decision received:', decision.decision, decision.score);
        setFinalDecision(decision);

        setMessages(prev => [
          ...prev,
          { id: 'decision', isDecision: true, decisionData: decision },
        ]);
        setPhase('complete');

      } catch (err) {
        console.error('[Frontend] Error:', err.message);
        const msg = err.response?.data?.error || err.message || 'Simulation failed';
        const code = err.response?.data?.code || (err.response?.status === 429 ? 'RATE_LIMIT' : 'SERVER_ERROR');
        setError(msg);
        setErrorCode(code);
        setPhase('error');
      }
    };

    run();
    return () => {};
  }, [navigate]);

  // Animate messages appearing one by one
  useEffect(() => {
    if (messages.length === 0) return;
    if (visibleCount >= messages.length) return;

    const timer = setTimeout(() => {
      setVisibleCount(c => c + 1);
    }, MSG_DELAY);

    return () => clearTimeout(timer);
  }, [messages, visibleCount]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCount]);

  const visibleMessages = messages.slice(0, visibleCount);
  const agentStatuses = getAgentStatuses(visibleMessages);
  const completedTasks = visibleMessages.filter(m => m.role).length;
  const isAnimating = visibleCount < messages.length;
  const nextAgent = isAnimating ? getNextAgent(messages, visibleCount) : null;
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
            <span style={{ fontSize: '1.5rem' }}>{isRateLimit ? '\u23F3' : '\u26A0\uFE0F'}</span>
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
                <li>Select a different provider (Cerebras, Groq, or Gemini)</li>
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

          <button className="btn-primary" onClick={goHome} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> {isRateLimit ? 'Change Provider' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header phase={phase} goHome={goHome} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat Column */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          borderRight: '1px solid var(--panel-border)',
        }}>
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            {/* Loading state before Round 1 arrives */}
            {phase === 'loading' && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    border: '3px solid var(--panel-border)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                  }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Experts are evaluating your idea...</p>
                </div>
              </div>
            )}

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

            {/* Waiting for next round */}
            {!isAnimating && (phase === 'round2' || phase === 'deciding') && !visibleMessages.some(m => m.id === 'decision') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const Header = ({ phase, goHome }) => (
  <header style={{
    padding: '12px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid var(--panel-border)', flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        onClick={goHome}
        style={{ background: 'none', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px', display: 'flex' }}
      >
        <ArrowLeft size={18} />
      </button>
      <Zap size={16} color="var(--primary)" />
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>StartupJudge</span>
      <StatusBadge phase={phase} />
    </div>
    {phase === 'complete' && (
      <button className="btn-primary" onClick={goHome} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
        New Analysis
      </button>
    )}
  </header>
);

const StatusBadge = ({ phase }) => {
  const config = {
    loading: { label: 'Evaluating...', color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
    round1: { label: 'Round 1', color: 'var(--primary)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
    round2: { label: 'Round 2', color: 'var(--warning)', bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.2)' },
    deciding: { label: 'Deciding...', color: 'var(--accent-orange)', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)' },
    complete: { label: 'Complete', color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)' },
    error: { label: 'Error', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' },
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
