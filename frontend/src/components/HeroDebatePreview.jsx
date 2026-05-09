import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENTS = [
  { name: 'Priya Sharma', role: 'CFO', color: '#22c55e', initial: 'P', message: 'Revenue model unclear. CAC/LTV ratio needs serious work before Series A.' },
  { name: 'Arjun Mehta', role: 'CTO', color: '#3b82f6', initial: 'A', message: 'Tech stack is scalable. MVP feasible in 8 weeks with a lean team.' },
  { name: 'Rahul Kapoor', role: 'Marketing', color: '#a855f7', initial: 'R', message: 'Strong positioning in underserved market. Content-led GTM recommended.' },
  { name: 'Kavita Iyer', role: 'Legal', color: '#f59e0b', initial: 'K', message: 'IP protection strategy needed. Standard SaaS terms sufficient for launch.' },
];

const VERDICT = { decision: 'PIVOT', score: 68 };

const HeroDebatePreview = () => {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCycle((c) => c + 1), 13000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40 max-w-md w-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-text-primary text-sm font-medium">Live Debate</span>
        </div>
        <span className="text-text-muted text-xs">6 agents evaluating</span>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={cycle}
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 1.8 } } }}
            className="space-y-3"
          >
            {AGENTS.map((agent) => (
              <motion.div
                key={agent.role}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                className="flex gap-3"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
                  style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                >
                  {agent.initial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-text-primary text-xs font-medium">{agent.name}</span>
                    <span className="text-text-muted text-[10px]">{agent.role}</span>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed">{agent.message}</p>
                </div>
              </motion.div>
            ))}

            {/* Verdict */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: 0.3 } },
              }}
              className="mt-4 flex items-center justify-between bg-accent/10 border border-accent/20 rounded-xl px-4 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs font-bold">{VERDICT.decision}</span>
                <span className="text-text-muted text-[10px]">Final Verdict</span>
              </div>
              <span className="text-accent text-sm font-bold">{VERDICT.score}/100</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroDebatePreview;
