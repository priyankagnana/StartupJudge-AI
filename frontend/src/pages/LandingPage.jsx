import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Users, MessageSquare, BarChart3, Zap,
  ChevronDown, ChevronUp, Settings,
  TrendingUp, Scale, Megaphone, UserCheck, Search,
  MessageCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useTheme } from '../context/ThemeContext';
import HeroDebatePreview from '../components/HeroDebatePreview';

const AGENTS = [
  { name: 'Priya Sharma', role: 'CFO', title: 'Ex-Kotak Investment Banker', focus: 'Unit economics in INR, CAC/LTV, burn rate, path to profitability', color: '#22c55e', icon: TrendingUp },
  { name: 'Arjun Mehta', role: 'CTO', title: 'Ex-Flipkart, YC-backed Founder', focus: 'Tech stack, scalability, MVP timeline, API limits (UPI, Razorpay)', color: '#3b82f6', icon: Zap },
  { name: 'Kavita Iyer', role: 'Legal', title: '10 yrs Indian Tech Law', focus: 'DPDPA 2023, IT Act, RBI compliance, GST, data localization', color: '#f59e0b', icon: Scale },
  { name: 'Rahul Kapoor', role: 'Marketing', title: 'Scaled 2 D2C Startups', focus: 'Go-to-market, Instagram/WhatsApp growth, pricing strategy', color: '#a855f7', icon: Megaphone },
  { name: 'Meera Patel', role: 'HR', title: 'Built Teams 3 to 150', focus: 'Hiring plans, salaries in LPA, Tier 1/2 talent dynamics', color: '#ec4899', icon: UserCheck },
  { name: 'Vikram Rao', role: 'Market Research', title: 'Ex-Bain Consultant', focus: 'Competitors by name, TAM sizing, Inc42/RedSeer data', color: '#06b6d4', icon: Search },
];

const STEPS = [
  { num: '01', title: 'Pitch your idea', desc: 'Describe your startup idea in plain English. No pitch deck needed.', icon: MessageCircle },
  { num: '02', title: '6 experts debate', desc: 'AI agents with distinct expertise evaluate, score, and challenge each other.', icon: Users },
  { num: '03', title: 'Get your verdict', desc: 'Receive a Go / Pivot / No-Go decision with scores and actionable suggestions.', icon: BarChart3 },
];

const FEATURES = [
  { icon: Users, title: '6 Domain Experts', desc: 'CFO, CTO, Legal, Marketing, HR, and Market Research evaluate every angle of your idea.' },
  { icon: MessageSquare, title: 'Live Debate Format', desc: 'Watch agents critique each other\'s assumptions in real-time cross-examination.' },
  { icon: BarChart3, title: 'Instant Verdict', desc: 'Weighted multi-domain risk scoring with a clear GO / PIVOT / NO-GO decision.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const LandingPage = () => {
  const [idea, setIdea] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState(localStorage.getItem('ai_provider') || '');
  const [apiKey, setApiKey] = useState(localStorage.getItem('user_api_key') || '');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleStart = (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    localStorage.setItem('startup_idea', idea);
    if (provider) localStorage.setItem('ai_provider', provider);
    else localStorage.removeItem('ai_provider');
    if (apiKey) localStorage.setItem('user_api_key', apiKey);
    else localStorage.removeItem('user_api_key');
    navigate('/simulate');
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* ====== HERO ====== */}
      <section className="pt-28 pb-16 lg:pt-40 lg:pb-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-8">
              <Users size={14} />
              6 AI Expert Agents
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-text-primary mb-6">
              Get your startup idea{' '}
              <span className="text-accent">judged by AI experts</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-text-secondary max-w-lg leading-relaxed mb-10">
              Pitch your concept to 6 domain experts. Watch them debate in real-time.
              Get a Go / Pivot / No-Go verdict in under 60 seconds.
            </motion.p>

            {/* Input form */}
            <motion.form variants={fadeUp} onSubmit={handleStart} className="w-full max-w-lg">
              <div className="relative">
                <textarea
                  placeholder="Describe your startup idea in a few sentences..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-text-primary text-sm leading-relaxed resize-none outline-none placeholder:text-text-muted focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!idea.trim()}
                className="w-full mt-3 bg-cta hover:bg-cta-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cta/20"
              >
                Get verdict in 60 seconds <ArrowRight size={16} />
              </button>
            </motion.form>

            {/* Settings toggle */}
            <motion.div variants={fadeUp} className="mt-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-text-muted hover:text-text-secondary text-xs flex items-center gap-1 transition-colors bg-transparent p-0"
              >
                <Settings size={12} />
                AI Provider settings
                {showSettings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showSettings && (
                <div className="mt-3 p-4 bg-surface border border-border rounded-xl flex gap-3 max-w-lg">
                  <div className="flex-1">
                    <label className="text-text-muted text-xs font-medium mb-1.5 block">Provider</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:border-accent/50"
                    >
                      <option value="">Default (server)</option>
                      <option value="cerebras">Cerebras (Llama 3.3 70B)</option>
                      <option value="groq">Groq (Llama 3.3 70B)</option>
                      <option value="gemini">Gemini 2.5 Flash-Lite</option>
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <label className="text-text-muted text-xs font-medium mb-1.5 block">
                      API Key <span className="opacity-50">(optional)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Uses server key if empty"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary text-sm outline-none focus:border-accent/50"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right — Debate Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:flex justify-center"
          >
            <HeroDebatePreview />
          </motion.div>
        </div>
      </section>

      {/* ====== TRUST BAR ====== */}
      <section className="border-y border-border py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <span className="text-text-muted text-xs uppercase tracking-widest">Powered by</span>
          <div className="flex items-center gap-6 text-text-muted/60 text-sm font-medium">
            <span>Cerebras</span>
            <span className="text-border">|</span>
            <span>Groq</span>
            <span className="text-border">|</span>
            <span>Gemini</span>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-text-muted text-xs uppercase tracking-[0.2em] font-medium text-center mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-3xl lg:text-5xl font-bold tracking-tight text-text-primary text-center mb-20"
          >
            Simple. Fast. Insightful.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl border border-border flex items-center justify-center">
                    <step.icon size={24} className="text-text-primary" />
                  </div>
                  <span className="text-text-muted text-sm font-medium">{step.num}</span>
                </div>
                <h3 className="text-text-primary font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="py-24 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-text-muted text-xs uppercase tracking-[0.2em] font-medium text-center mb-4"
          >
            Why StartupJudge?
          </motion.p>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-3xl lg:text-5xl font-bold tracking-tight text-text-primary text-center mb-16"
          >
            Built for founders. By builders.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-border-subtle transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center shrink-0">
                    <feat.icon size={20} className="text-text-primary" />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold text-base mb-1">{feat.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== AGENT SHOWCASE ====== */}
      <section id="agents" className="py-24 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-3xl lg:text-4xl font-bold tracking-tight text-text-primary text-center mb-4"
          >
            Meet your board of advisors
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-text-muted text-center mb-16 max-w-md mx-auto"
          >
            Six AI experts with distinct perspectives, debating your idea in real-time.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.role}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="bg-surface border border-border rounded-xl p-6 hover:border-border-subtle transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-text-primary text-sm font-medium">{agent.name}</div>
                    <div className="text-xs font-medium" style={{ color: agent.color }}>{agent.role}</div>
                  </div>
                </div>
                <p className="text-text-secondary text-xs font-medium mb-2">{agent.title}</p>
                <p className="text-text-muted text-sm leading-relaxed">{agent.focus}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-32 px-6 lg:px-12 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-3xl lg:text-5xl font-bold tracking-tight text-text-primary mb-4"
          >
            Ready to validate your idea?
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="text-text-muted text-lg mb-10"
          >
            Get an AI-powered evaluation from 6 expert perspectives in under 60 seconds.
          </motion.p>
          <motion.form
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            onSubmit={handleStart}
            className="max-w-lg mx-auto"
          >
            <textarea
              placeholder="Describe your startup idea..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
              className="w-full bg-surface border border-border rounded-xl px-5 py-4 text-text-primary text-sm leading-relaxed resize-none outline-none placeholder:text-text-muted focus:border-accent/50 focus:ring-1 focus:ring-accent/25 transition-all"
            />
            <button
              type="submit"
              disabled={!idea.trim()}
              className="w-full mt-3 bg-cta hover:bg-cta-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-cta/20"
            >
              Get verdict in 60 seconds <ArrowRight size={16} />
            </button>
          </motion.form>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-border py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={theme === 'dark' ? '/darkmodelogo.png' : '/lightmodelogo.png'} alt="StartupJudge" style={{ height: '40px' }} />
          </div>
          <p className="text-text-muted text-xs">Built with AI. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
