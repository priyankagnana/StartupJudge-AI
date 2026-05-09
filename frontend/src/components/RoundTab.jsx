import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const MSG_DELAY = 800;

const RoundTab = ({ messages, isLive, roundLabel }) => {
  const [visibleCount, setVisibleCount] = useState(isLive ? 0 : messages.length);
  const endRef = useRef(null);
  const prevLengthRef = useRef(messages.length);

  useEffect(() => {
    if (!isLive) {
      setVisibleCount(messages.length);
      return;
    }
    if (messages.length > prevLengthRef.current) {
      prevLengthRef.current = messages.length;
    }
  }, [messages.length, isLive]);

  useEffect(() => {
    if (!isLive) return;
    if (visibleCount >= messages.length) return;

    const timer = setTimeout(() => {
      setVisibleCount(c => c + 1);
    }, MSG_DELAY);
    return () => clearTimeout(timer);
  }, [messages.length, visibleCount, isLive]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleCount]);

  const visible = messages.slice(0, visibleCount);
  const isAnimating = isLive && visibleCount < messages.length;
  const nextMsg = isAnimating ? messages[visibleCount] : null;
  const nextAgent = nextMsg?.role || null;

  return (
    <div className="px-3 py-4 sm:p-6" style={{
      flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: '16px',
    }}>
      {roundLabel && messages.length === 0 && (
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Waiting for {roundLabel}...
            </p>
          </div>
        </div>
      )}

      {visible.map((msg) => (
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

      <div ref={endRef} />
    </div>
  );
};

export default RoundTab;
