import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRound1, fetchRound2, fetchDecision, createSimulation, updateSimulation, getSimulation, generateQuestions as fetchQuestions } from '../services/api';
import { ArrowLeft, Sun, Moon, LogOut, Settings, ChevronDown, BarChart3, X, PanelLeft } from 'lucide-react';
import QAFlow from '../components/QAFlow';
import DebateTabs from '../components/DebateTabs';
import RoundTab from '../components/RoundTab';
import VerdictTab from '../components/VerdictTab';
import AgentStatusList from '../components/AgentStatusList';
import PreliminaryScores from '../components/PreliminaryScores';
import DashboardPanel from '../components/DashboardPanel';
import LoadingStatus from '../components/LoadingStatus';
import { useSimulations } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ROLE_ORDER = ['CFO', 'CTO', 'Legal', 'Marketing', 'HR', 'Market Research'];

function getAgentStatuses(r1Messages, r2Messages) {
  const statuses = {};
  for (const role of ROLE_ORDER) statuses[role] = 'waiting';
  for (const msg of [...r1Messages, ...r2Messages]) {
    if (msg.role) statuses[msg.role] = 'complete';
  }
  return statuses;
}

function buildEnrichedIdea(idea, qaAnswers) {
  if (!qaAnswers) return idea;
  const parts = [`Startup Idea: ${idea}`, '', 'Additional Context:'];
  for (const [key, value] of Object.entries(qaAnswers)) {
    if (value) parts.push(`- ${key.replace(/_/g, ' ')}: ${value}`);
  }
  return parts.join('\n');
}

function rebuildMessages(simulation, round) {
  const messages = [];
  const data = round === 1 ? simulation.round1Data : simulation.round2Data;
  if (!data) return messages;

  if (round === 1) {
    messages.push({ id: 'system-start', isSystem: true, content: `Analyzing: "${simulation.idea.substring(0, 100)}${simulation.idea.length > 100 ? '...' : ''}" with 6 expert agents` });
    messages.push({ id: 'round1-header', isSystem: true, content: 'Round 1 — Each expert evaluates independently' });
  } else {
    messages.push({ id: 'round2-header', isSystem: true, content: 'Round 2 — Cross-Examination. Agents critique each other.' });
  }

  ROLE_ORDER.forEach(role => {
    const agentData = data[role];
    if (agentData) {
      messages.push({
        id: `r${round}-${role}`,
        role,
        round,
        content: round === 1 ? (agentData.assessment || 'No evaluation') : (agentData.critique || 'No critique'),
        score: round === 1 ? agentData.score : undefined,
        risks: round === 1 ? agentData.risks : undefined,
      });
    }
  });

  return messages;
}

const SimulationView = ({ onToggleSidebar }) => {
  const { id: simId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addSimulationToList, updateSimulationInList, setCurrentSimulationId, setIsReadOnly } = useSimulations();
  const { theme } = useTheme();

  const [phase, setPhase] = useState(simId ? 'loading' : 'idle');
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [activeTab, setActiveTab] = useState('round1');
  const [idleIdea, setIdleIdea] = useState('');

  const [round1Messages, setRound1Messages] = useState([]);
  const [round2Messages, setRound2Messages] = useState([]);
  const [round1Data, setRound1Data] = useState(null);
  const [round2Data, setRound2Data] = useState(null);
  const [finalDecision, setFinalDecision] = useState(null);
  const [qaAnswers, setQaAnswers] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const ideaRef = useRef('');
  const simIdRef = useRef(null);
  const runningRef = useRef(false);

  const goHome = () => navigate('/');

  // Load past simulation if simId is present
  useEffect(() => {
    if (!simId) {
      setCurrentSimulationId(null);
      setIsReadOnly(false);
      setReadOnly(false);
      return;
    }

    setCurrentSimulationId(simId);
    setIsReadOnly(true);
    setReadOnly(true);

    getSimulation(simId).then(({ simulation }) => {
      ideaRef.current = simulation.idea;
      setQaAnswers(simulation.qaAnswers || null);

      if (simulation.round1Data) {
        setRound1Data(simulation.round1Data);
        setRound1Messages(rebuildMessages(simulation, 1));
      }
      if (simulation.round2Data) {
        setRound2Data(simulation.round2Data);
        setRound2Messages(rebuildMessages(simulation, 2));
      }
      if (simulation.decision) {
        setFinalDecision(simulation.decision);
        setPhase('complete');
        setActiveTab('verdict');
      } else if (simulation.round2Data) {
        setPhase('complete');
        setActiveTab('round2');
      } else if (simulation.round1Data) {
        setPhase('complete');
        setActiveTab('round1');
      } else {
        setPhase('complete');
      }
    }).catch(() => {
      setError('Failed to load simulation');
      setPhase('error');
    });
  }, [simId, setCurrentSimulationId, setIsReadOnly]);

  // Load idea from location state or localStorage for new simulations
  useEffect(() => {
    if (simId) return;
    const stateIdea = location.state?.idea;
    if (stateIdea) {
      ideaRef.current = stateIdea;
      setPhase('generating');
      fetchQuestions(stateIdea).then(({ questions }) => setDynamicQuestions(questions)).catch(() => setDynamicQuestions(null)).finally(() => setPhase('qa'));
    } else {
      const stored = localStorage.getItem('startup_idea');
      if (stored) {
        ideaRef.current = stored;
        setPhase('generating');
        fetchQuestions(stored).then(({ questions }) => setDynamicQuestions(questions)).catch(() => setDynamicQuestions(null)).finally(() => setPhase('qa'));
      } else {
        ideaRef.current = '';
        simIdRef.current = null;
        runningRef.current = false;
        setPhase('idle');
        setIdleIdea('');
        setDynamicQuestions(null);
        setRound1Messages([]);
        setRound2Messages([]);
        setRound1Data(null);
        setRound2Data(null);
        setFinalDecision(null);
        setQaAnswers(null);
        setError(null);
        setErrorCode(null);
        setReadOnly(false);
        setActiveTab('round1');
      }
    }
  }, [simId, location.state]);

  const handleIdleSubmit = async (e) => {
    e.preventDefault();
    if (!idleIdea.trim()) return;
    ideaRef.current = idleIdea.trim();
    localStorage.setItem('startup_idea', idleIdea.trim());
    setPhase('generating');
    try {
      const { questions } = await fetchQuestions(idleIdea.trim());
      setDynamicQuestions(questions);
    } catch {
      setDynamicQuestions(null);
    }
    setPhase('qa');
  };

  const runSimulation = useCallback(async (answers) => {
    if (runningRef.current) return;
    runningRef.current = true;

    const rawIdea = ideaRef.current;
    if (!rawIdea) { navigate('/'); return; }

    const enrichedIdea = buildEnrichedIdea(rawIdea, answers);
    setQaAnswers(answers);
    setPhase('loading');
    setActiveTab('round1');

    // Create simulation record
    let currentSimId = null;
    try {
      const { simulation } = await createSimulation({
        idea: rawIdea,
        qaAnswers: answers,
        provider: localStorage.getItem('ai_provider') || undefined,
      });
      currentSimId = simulation._id;
      simIdRef.current = currentSimId;
      setCurrentSimulationId(currentSimId);
      addSimulationToList(simulation);
      localStorage.removeItem('startup_idea');
    } catch {}

    try {
      // System messages for Round 1
      const r1SystemMsgs = [
        { id: 'system-start', isSystem: true, content: `Analyzing: "${rawIdea.substring(0, 100)}${rawIdea.length > 100 ? '...' : ''}" with 6 expert agents` },
        { id: 'round1-header', isSystem: true, content: 'Round 1 — Each expert evaluates independently' },
      ];
      setRound1Messages(r1SystemMsgs);
      setPhase('round1');

      // Round 1
      const r1 = await fetchRound1(enrichedIdea);
      setRound1Data(r1.agents);

      const r1AgentMsgs = ROLE_ORDER.map(role => ({
        id: `r1-${role}`, role, round: 1,
        content: r1.agents[role]?.assessment || 'No evaluation',
        score: r1.agents[role]?.score,
        risks: r1.agents[role]?.risks,
      }));
      setRound1Messages([...r1SystemMsgs, ...r1AgentMsgs]);

      if (currentSimId) {
        updateSimulation(currentSimId, { round1Data: r1.agents }).catch(() => {});
        updateSimulationInList(currentSimId, { status: 'in_progress' });
      }

      // Wait for animation
      await sleep(ROLE_ORDER.length * 800 + 2000);

      // Round 2
      setPhase('round2');
      setActiveTab('round2');

      const r2SystemMsgs = [
        { id: 'round2-header', isSystem: true, content: 'Round 2 — Cross-Examination. Agents critique each other.' },
      ];
      setRound2Messages(r2SystemMsgs);

      const r2 = await fetchRound2(enrichedIdea, r1.agents);
      setRound2Data(r2.agents);

      const r2AgentMsgs = ROLE_ORDER.map(role => ({
        id: `r2-${role}`, role, round: 2,
        content: r2.agents[role]?.critique || 'No critique',
      }));
      setRound2Messages([...r2SystemMsgs, ...r2AgentMsgs]);

      if (currentSimId) {
        updateSimulation(currentSimId, { round2Data: r2.agents }).catch(() => {});
      }

      await sleep(ROLE_ORDER.length * 800 + 2000);

      // Decision
      setPhase('deciding');
      const decision = await fetchDecision(enrichedIdea, r1.agents, r2.agents);
      setFinalDecision(decision);
      setPhase('complete');
      setActiveTab('verdict');

      if (currentSimId) {
        updateSimulation(currentSimId, {
          decision, verdict: decision.decision, score: decision.score, status: 'complete',
        }).catch(() => {});
        updateSimulationInList(currentSimId, {
          verdict: decision.decision, score: decision.score, status: 'complete',
        });
      }

    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Simulation failed';
      const code = err.response?.data?.code || (err.response?.status === 429 ? 'RATE_LIMIT' : 'SERVER_ERROR');
      setError(msg);
      setErrorCode(code);
      setPhase('error');

      if (currentSimId) {
        updateSimulation(currentSimId, { status: 'failed' }).catch(() => {});
        updateSimulationInList(currentSimId, { status: 'failed' });
      }
    } finally {
      runningRef.current = false;
    }
  }, [navigate, addSimulationToList, updateSimulationInList, setCurrentSimulationId]);

  const handleQAComplete = (answers) => runSimulation(answers);
  const handleQASkip = () => runSimulation(null);

  const handleRefine = (modifiedIdea) => {
    localStorage.setItem('startup_idea', modifiedIdea);
    navigate('/simulate', { state: { idea: modifiedIdea } });
    setPhase('qa');
    setRound1Messages([]);
    setRound2Messages([]);
    setRound1Data(null);
    setRound2Data(null);
    setFinalDecision(null);
    setQaAnswers(null);
    setError(null);
    setReadOnly(false);
    ideaRef.current = modifiedIdea;
    simIdRef.current = null;
    runningRef.current = false;
  };

  const completedR1 = round1Messages.filter(m => m.role).length;
  const completedR2 = round2Messages.filter(m => m.role).length;
  const agentStatuses = getAgentStatuses(round1Messages, round2Messages);

  // Error screen
  if (error) {
    const isRateLimit = errorCode === 'RATE_LIMIT';
    return (
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '480px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: isRateLimit ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ fontSize: '1.5rem' }}>{isRateLimit ? '⏳' : '⚠️'}</span>
          </div>
          <h2 style={{ color: isRateLimit ? 'var(--warning)' : 'var(--danger)', marginBottom: '12px', fontSize: '1.2rem' }}>
            {isRateLimit ? 'Free Quota Exhausted' : 'Simulation Failed'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>{error}</p>
          {isRateLimit && (
            <div style={{
              padding: '16px', borderRadius: '10px', textAlign: 'left',
              background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.12)',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>How to fix this:</p>
              <ol style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '18px' }}>
                <li>Click your profile icon in the top-right</li>
                <li>Open <strong>API Settings</strong></li>
                <li>Select a different provider or enter your own API key</li>
              </ol>
            </div>
          )}
          <button className="btn-primary" onClick={() => { setError(null); setErrorCode(null); setPhase('idle'); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> {isRateLimit ? 'Change Provider' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header phase={phase} goHome={goHome} readOnly={readOnly} onToggleSidebar={onToggleSidebar} />

      {/* Idle Phase — idea input */}
      {phase === 'idle' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', maxWidth: '520px', textAlign: 'center', padding: '0 4px' }}
          >
            <img src={theme === 'dark' ? '/darkmodelogo.png' : '/lightmodelogo.png'} alt="StartupJudge" style={{ height: '48px', margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              What's your startup idea?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Describe your concept and our panel of 6 AI experts will evaluate it.
            </p>
            <form onSubmit={handleIdleSubmit}>
              <textarea
                value={idleIdea}
                onChange={(e) => setIdleIdea(e.target.value)}
                placeholder="e.g. An AI-powered platform that connects local home chefs with office workers for healthy lunch deliveries..."
                rows={4}
                style={{
                  width: '100%', padding: '14px', borderRadius: '12px', resize: 'vertical',
                  background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
                  color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6,
                  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={!idleIdea.trim()}
                className="btn-primary"
                style={{
                  marginTop: '16px', padding: '12px 32px', fontSize: '0.9rem', width: '100%',
                  opacity: idleIdea.trim() ? 1 : 0.5, cursor: idleIdea.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Evaluate My Idea
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Generating questions */}
      {phase === 'generating' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid var(--panel-border)', borderTopColor: 'var(--primary)',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tailoring questions to your idea...</p>
        </div>
      )}

      {/* Q&A Phase */}
      {phase === 'qa' && (
        <QAFlow onComplete={handleQAComplete} onSkip={handleQASkip} dynamicQuestions={dynamicQuestions} />
      )}

      {/* Loading */}
      {phase === 'loading' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingStatus />
        </div>
      )}

      {/* Main debate area */}
      {!['idle', 'generating', 'qa', 'loading', 'error'].includes(phase) && (
        <div className="debate-layout">
          {/* Chat Column with Tabs */}
          <div className="debate-chat">
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--panel-border)', flexShrink: 0 }}>
              <DebateTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                phase={phase}
                round1Count={completedR1}
                round2Count={completedR2}
              />
              <button
                className="debate-sidebar-toggle"
                onClick={() => setMobilePanelOpen(true)}
                style={{ marginRight: '12px', marginLeft: 'auto', whiteSpace: 'nowrap' }}
              >
                <BarChart3 size={14} /> Panel
              </button>
            </div>

            {activeTab === 'round1' && (
              <RoundTab
                messages={round1Messages}
                isLive={!readOnly && ['round1', 'round2', 'deciding', 'complete'].includes(phase)}
                roundLabel="Round 1 evaluations"
              />
            )}

            {activeTab === 'round2' && (
              <RoundTab
                messages={round2Messages}
                isLive={!readOnly && ['round2', 'deciding', 'complete'].includes(phase)}
                roundLabel="Round 2 cross-examination"
              />
            )}

            {activeTab === 'verdict' && (
              <VerdictTab
                decision={finalDecision}
                conflicts={finalDecision?.conflicts}
                idea={ideaRef.current}
                onRefine={readOnly ? undefined : handleRefine}
              />
            )}

            {/* Waiting spinner between rounds */}
            {activeTab !== 'verdict' && !readOnly && (phase === 'deciding') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '16px', flexShrink: 0 }}
              >
                <LoadingStatus />
              </motion.div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className={`debate-sidebar ${mobilePanelOpen ? 'mobile-open' : ''}`}>
            <button
              className="debate-sidebar-toggle"
              onClick={() => setMobilePanelOpen(false)}
              style={{ alignSelf: 'flex-end', border: 'none', padding: '8px', marginBottom: '8px' }}
            >
              <X size={20} /> Close
            </button>

            <AgentStatusList
              statuses={agentStatuses}
              completedCount={completedR1 + completedR2}
            />

            {/* Preliminary scores after Round 1 */}
            <AnimatePresence>
              {round1Data && !finalDecision && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '20px' }}
                >
                  <PreliminaryScores round1Data={round1Data} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full dashboard after verdict */}
            <AnimatePresence>
              {finalDecision && (
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
      )}
    </div>
  );
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const Header = ({ phase, goHome, readOnly, onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('user_api_key') || '');
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setApiSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveApiSettings = () => {
    if (provider) localStorage.setItem('ai_provider', provider);
    else localStorage.removeItem('ai_provider');
    if (apiKey) localStorage.setItem('user_api_key', apiKey);
    else localStorage.removeItem('user_api_key');
    setApiSettingsOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header style={{
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--panel-border)', flexShrink: 0,
      gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="sm:hidden"
            style={{ background: 'none', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px', display: 'flex', flexShrink: 0 }}
          >
            <PanelLeft size={18} />
          </button>
        )}
        <button
          onClick={goHome}
          className="hidden sm:flex"
          style={{ background: 'none', color: 'var(--text-muted)', padding: '6px', borderRadius: '6px', flexShrink: 0 }}
        >
          <ArrowLeft size={18} />
        </button>
        <img src={theme === 'dark' ? '/darkmodelogo.png' : '/lightmodelogo.png'} alt="StartupJudge" className="hidden sm:block" style={{ height: '36px' }} />
        <StatusBadge phase={phase} />
        {readOnly && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 500, padding: '2px 8px', borderRadius: '4px',
            background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--panel-border)',
            whiteSpace: 'nowrap',
          }}>
            Read-only
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {phase === 'complete' && !readOnly && (
          <button className="btn-primary hidden sm:inline-flex" onClick={() => { navigate('/simulate', { state: { reset: Date.now() } }); }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            New Analysis
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none', color: 'var(--text-muted)', padding: '6px',
            borderRadius: '6px', display: 'flex', cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Profile dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', cursor: 'pointer', padding: '4px',
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 600,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '8px',
              width: '260px', background: 'var(--bg-color)',
              border: '1px solid var(--panel-border)', borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 50,
              overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--panel-border)' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.email}</p>
              </div>

              {/* API Settings toggle */}
              <button
                onClick={() => setApiSettingsOpen(!apiSettingsOpen)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', background: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: '0.8rem',
                  borderBottom: apiSettingsOpen ? 'none' : '1px solid var(--panel-border)',
                }}
              >
                <Settings size={14} /> API Settings
                <ChevronDown size={12} style={{ marginLeft: 'auto', transform: apiSettingsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {/* API Settings panel */}
              {apiSettingsOpen && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--panel-border)', background: 'var(--bg-color)' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    style={{
                      width: '100%', padding: '6px 8px', borderRadius: '6px', fontSize: '0.8rem',
                      background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
                      color: 'var(--text-main)', outline: 'none', marginBottom: '8px',
                    }}
                  >
                    <option value="">Default (server)</option>
                    <option value="cerebras">Cerebras</option>
                    <option value="groq">Groq</option>
                    <option value="gemini">Gemini</option>
                  </select>

                  <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>API Key (optional)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your own API key"
                    style={{
                      width: '100%', padding: '6px 8px', borderRadius: '6px', fontSize: '0.8rem',
                      background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
                      color: 'var(--text-main)', outline: 'none', marginBottom: '8px',
                    }}
                  />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                    Add your own key if the default quota is exhausted.
                  </p>
                  <button
                    onClick={saveApiSettings}
                    style={{
                      width: '100%', padding: '6px', borderRadius: '6px', fontSize: '0.75rem',
                      fontWeight: 600, background: 'var(--primary)', color: 'white', cursor: 'pointer',
                    }}
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', background: 'none', cursor: 'pointer',
                  color: 'var(--danger)', fontSize: '0.8rem',
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const StatusBadge = ({ phase }) => {
  const config = {
    idle: { label: 'New', color: 'var(--accent)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
    generating: { label: 'Preparing...', color: 'var(--accent)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
    qa: { label: 'Setup', color: 'var(--primary)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
    loading: { label: 'Evaluating...', color: 'var(--primary)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
    round1: { label: 'Round 1', color: 'var(--primary)', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
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
