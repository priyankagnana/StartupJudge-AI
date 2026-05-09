import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Assembling the panel of judges...',
  'Briefing experts on your idea...',
  'Judges are deliberating...',
  'Deep in analysis...',
  'Cross-referencing market data...',
];

const LoadingStatus = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '36px', height: '36px',
        border: '3px solid var(--panel-border)', borderTopColor: 'var(--primary)',
        borderRadius: '50%', animation: 'spin 1s linear infinite',
      }} />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default LoadingStatus;
