import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, SkipForward } from 'lucide-react';

const FALLBACK_QUESTIONS = [
  {
    key: 'targetMarket',
    question: 'Who is your target customer?',
    type: 'input',
    placeholder: 'e.g., College students in Tier 2 cities, 18-24 age group',
  },
  {
    key: 'revenueModel',
    question: "What's your revenue model?",
    type: 'mcq',
    options: ['Subscription', 'Marketplace / Commission', 'Freemium', 'Advertising', 'One-time purchase', 'Other'],
  },
  {
    key: 'stage',
    question: 'What stage are you at?',
    type: 'mcq',
    options: ['Just an idea', 'Building MVP', 'MVP built', 'Have early customers', 'Revenue generating'],
  },
  {
    key: 'team',
    question: "What's your team like?",
    type: 'mcq',
    options: ['Solo founder', '2-3 co-founders', 'Small team (4-10)', 'Larger team (10+)'],
  },
  {
    key: 'budget',
    question: "What's your budget situation?",
    type: 'mcq',
    options: ['Bootstrapping (no funds)', 'Under 5 lakh', '5-25 lakh', '25 lakh - 1 crore', '1 crore+', 'Seeking funding'],
  },
];

const QAFlow = ({ onComplete, onSkip, dynamicQuestions }) => {
  const questions = dynamicQuestions && dynamicQuestions.length > 0 ? dynamicQuestions : FALLBACK_QUESTIONS;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);

  const current = questions[step];

  const setAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [current.key]: value }));
  };

  const next = () => {
    if (step < questions.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      onComplete(answers);
    }
  };

  const back = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const hasAnswer = !!answers[current.key]?.trim();
  const isLast = step === questions.length - 1;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {step + 1} of {questions.length}
          </span>
          <div style={{ flex: 1, height: '3px', background: 'var(--panel-border)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px' }}
            />
          </div>
          <button
            onClick={onSkip}
            style={{
              background: 'none', color: 'var(--text-muted)', fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            Skip <SkipForward size={12} />
          </button>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '24px', lineHeight: 1.3 }}>
              {current.question}
            </h2>

            {current.type === 'input' && (
              <input
                type="text"
                value={answers[current.key] || ''}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={current.placeholder || ''}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && hasAnswer && next()}
                style={{
                  width: '100%', padding: '14px 18px', fontSize: '0.95rem',
                  background: 'var(--bg-card)', border: '1px solid var(--panel-border)',
                  borderRadius: '10px', color: 'var(--text-main)', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            )}

            {current.type === 'mcq' && current.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {current.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(opt)}
                    style={{
                      padding: '14px 18px', fontSize: '0.9rem', textAlign: 'left',
                      background: answers[current.key] === opt ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                      border: `1px solid ${answers[current.key] === opt ? 'rgba(245, 158, 11, 0.3)' : 'var(--panel-border)'}`,
                      borderRadius: '10px',
                      color: answers[current.key] === opt ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: answers[current.key] === opt ? 600 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button
            onClick={back}
            disabled={step === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', color: step === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              fontSize: '0.9rem', opacity: step === 0 ? 0.4 : 1, cursor: step === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <button
            onClick={next}
            disabled={!hasAnswer}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 24px', fontSize: '0.9rem',
              opacity: hasAnswer ? 1 : 0.4, cursor: hasAnswer ? 'pointer' : 'not-allowed',
            }}
          >
            {isLast ? 'Start Evaluation' : 'Next'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QAFlow;
