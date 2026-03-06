import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  RefreshCcw, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const CircularMeter = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = 'var(--success)';
  if (score < 40) color = 'var(--danger)';
  else if (score < 75) color = 'var(--warning)';

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="var(--panel-border)"
          strokeWidth="12"
          fill="none"
        />
        <motion.circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
};

const Dashboard = ({ data }) => {
  const navigate = useNavigate();

  // If page reloaded and data is gone, redirect.
  useEffect(() => {
    if (!data) {
      navigate('/');
    }
  }, [data, navigate]);

  if (!data) return null;

  const decision = data.finalDecision.decision;
  let decisionColor = 'var(--warning)';
  if (decision === 'GO') decisionColor = 'var(--success)';
  if (decision === 'NO-GO') decisionColor = 'var(--danger)';

  // Mocked for the MVP UI layout
  const riskCategories = [
    { name: 'Financial Risk', level: 85, color: '#f85149' },
    { name: 'Market Saturation', level: 40, color: '#2ea043' },
    { name: 'Tech Sprawl', level: 60, color: '#d29922' },
    { name: 'Legal / Compliance', level: 20, color: '#2ea043' }
  ];

  const suggestions = [
    "Refine the customer acquisition cost model as flagged by the CFO.",
    "Consider a phased rollout to mitigate technical sprawl.",
    "Target niche B2B segment first to avoid direct market saturation."
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '2rem 4rem', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Boardroom Decision</h1>
          <p style={{ color: 'var(--text-muted)' }}>Analysis complete for: "{data.idea}"</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCcw size={16} /> New Simulation
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', flex: 1 }}>
        
        {/* Left Column: Final Verdict */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel" 
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Startup Health Meter</h3>
            <CircularMeter score={data.finalDecision.score} />
            <div style={{ marginTop: '2rem' }}>
              <span style={{ 
                background: `${decisionColor}20`,
                color: decisionColor, 
                padding: '12px 24px', 
                borderRadius: '8px', 
                fontSize: '1.5rem', 
                fontWeight: 700,
                border: `1px solid ${decisionColor}40`
              }}>
                {decision}
              </span>
            </div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {data.finalDecision.summary}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel" 
            style={{ padding: '2rem' }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <TrendingUp size={20} color="var(--primary)" /> 
              Actionable Suggestions
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
              {suggestions.map((suggestion, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                  <CheckCircle size={18} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{suggestion}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Right Column: Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel" 
            style={{ padding: '2rem', flex: 1 }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' }}>
              <ShieldAlert size={20} color="var(--warning)" />
              Risk Breakdown Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {riskCategories.map((risk, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span>{risk.name}</span>
                    <span style={{ color: risk.color, fontWeight: 600 }}>{risk.level}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--panel-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${risk.level}%` }}
                      transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                      style={{ height: '100%', background: risk.color, borderRadius: '4px' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '3rem', 
              padding: '1.5rem', 
              background: 'rgba(248, 81, 73, 0.05)', 
              border: '1px solid rgba(248, 81, 73, 0.2)', 
              borderRadius: '8px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ color: 'var(--danger)', marginBottom: '4px' }}>Top Concern: Financial Exposure</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  The CFO and Market Analyst flagged significant friction in the proposed revenue model. Strong likelihood of high Customer Acquisition Cost (CAC) outpacing LTV initially.
                </p>
              </div>
            </div>

          </motion.div>
          
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
