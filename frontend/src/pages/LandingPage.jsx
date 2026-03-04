import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Activity } from 'lucide-react';

const LandingPage = () => {
  const [idea, setIdea] = useState('');
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (idea.trim()) {
      // Store the idea in localStorage or state to pass it to the simulation
      localStorage.setItem('startup_idea', idea);
      navigate('/simulate');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center'
        }}
        className="glass-panel"
      >
        <div style={{ padding: '4rem 2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            color: '#818cf8',
            fontWeight: 500,
            marginBottom: '2rem'
          }}>
            <Activity size={18} />
            <span>AI-Powered Startup Simulator</span>
          </div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '1.5rem',
            background: 'linear-gradient(to right, #ffffff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Judge Your Startup Idea <br /> Like a Real Boardroom
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem auto'
          }}>
            Pitch your concept to 6 expert AI agents. Get ruthless feedback, risk analysis, and a final Go/No-Go decision.
          </p>
          
          <form onSubmit={handleStart} style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }}>
                <Lightbulb size={24} />
              </div>
              <input
                type="text"
                placeholder="Describe your startup idea in a sentence or two..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                  fontSize: '1.1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--panel-border)'}
              />
              <button 
                type="submit" 
                className="btn-primary"
                disabled={!idea.trim()}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  padding: '0.8rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Start Simulation <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        display: 'flex',
        gap: '2rem'
      }}>
        <span>✓ 6 Expert Profiles</span>
        <span>✓ Real-time Debate</span>
        <span>✓ Objective Scoring</span>
      </div>
    </div>
  );
};

export default LandingPage;
