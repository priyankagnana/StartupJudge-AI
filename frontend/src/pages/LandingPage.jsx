import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Settings, ChevronDown, ChevronUp,
  Users, MessageSquare, BarChart3, Zap
} from 'lucide-react';

const LandingPage = () => {
  const [idea, setIdea] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('user_api_key') || '');
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (idea.trim()) {
      localStorage.setItem('startup_idea', idea);
      if (provider) localStorage.setItem('ai_provider', provider);
      else localStorage.removeItem('ai_provider');
      if (apiKey) localStorage.setItem('user_api_key', apiKey);
      else localStorage.removeItem('user_api_key');
      navigate('/simulate');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>StartupJudge</span>
        </div>
        <button
          className="btn-secondary"
          onClick={() => setShowSettings(!showSettings)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <Settings size={14} />
          <span style={{ fontSize: '0.8rem' }}>Provider</span>
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px 80px',
        maxWidth: '720px',
        margin: '0 auto',
        width: '100%',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', width: '100%' }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            marginBottom: '32px',
          }}>
            <Users size={14} />
            6 AI Expert Agents
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            color: 'var(--text-main)',
          }}>
            Get your startup idea<br />
            <span style={{ color: 'var(--primary)' }}>judged by AI experts</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-muted)',
            marginBottom: '48px',
            maxWidth: '520px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}>
            Pitch your concept to 6 domain experts. Watch them debate in real-time.
            Get a Go / Pivot / No-Go verdict in under a minute.
          </p>

          {/* Input */}
          <form onSubmit={handleStart} style={{ width: '100%' }}>
            <textarea
              placeholder="Describe your startup idea..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '1rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--panel-border)',
                borderRadius: '12px',
                color: 'var(--text-main)',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                lineHeight: 1.6,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--panel-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={!idea.trim()}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '14px',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              Start Analysis <ArrowRight size={18} />
            </button>
          </form>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  marginTop: '16px',
                  padding: '20px',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--panel-border)',
                  display: 'flex',
                  gap: '16px',
                  textAlign: 'left',
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>
                      Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    >
                      <option value="">Default (server)</option>
                      <option value="cerebras">Cerebras (Llama 3.3 70B)</option>
                      <option value="groq">Groq (Llama 3.3 70B)</option>
                      <option value="gemini">Gemini 2.5 Flash-Lite</option>
                    </select>
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 500 }}>
                      API Key <span style={{ opacity: 0.5 }}>(optional)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Uses server key if empty"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-color)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Feature Strip */}
      <div style={{
        borderTop: '1px solid var(--panel-border)',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
        }}>
          {[
            { icon: Users, title: '6 Expert Agents', desc: 'CFO, CTO, Legal, Marketing, HR, and Market Research' },
            { icon: MessageSquare, title: 'Live Debate', desc: 'Watch agents evaluate and critique each other in real-time' },
            { icon: BarChart3, title: 'Risk Scoring', desc: 'Weighted multi-domain analysis with actionable suggestions' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <Icon size={20} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{title}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        opacity: 0.5,
      }}>
        Built with AI. Not financial advice.
      </div>
    </div>
  );
};

export default LandingPage;
