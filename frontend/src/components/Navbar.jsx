import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isLanding = location.pathname === '/';

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-bg/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src={theme === 'dark' ? '/darkmodelogo.png' : '/lightmodelogo.png'} alt="StartupJudge" style={{ height: '48px' }} />
        </Link>

        {/* Center nav links (desktop, landing only) */}
        {isLanding && (
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-text-muted hover:text-text-primary text-sm transition-colors bg-transparent p-0">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="text-text-muted hover:text-text-primary text-sm transition-colors bg-transparent p-0">How it works</button>
            <button onClick={() => scrollTo('agents')} className="text-text-muted hover:text-text-primary text-sm transition-colors bg-transparent p-0">Agents</button>
          </div>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-text-muted hover:text-text-primary bg-transparent p-1.5 rounded-lg hover:bg-surface transition-all"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/simulate" className="text-text-muted hover:text-text-primary text-sm transition-colors no-underline">
                My Simulations
              </Link>
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <button onClick={logout} className="text-text-muted hover:text-text-primary text-sm transition-colors bg-transparent p-0">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-text-secondary hover:text-text-primary text-sm transition-colors no-underline px-4 py-2">
                Log in
              </Link>
              <Link to="/signup" className="bg-cta hover:bg-cta-hover text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors no-underline">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-text-secondary bg-transparent p-0">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-bg/95 backdrop-blur-xl border-b border-border px-6 pb-6 pt-2">
          {isLanding && (
            <div className="flex flex-col gap-3 mb-4">
              <button onClick={() => scrollTo('features')} className="text-text-muted hover:text-text-primary text-sm text-left bg-transparent p-0">Features</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-text-muted hover:text-text-primary text-sm text-left bg-transparent p-0">How it works</button>
              <button onClick={() => scrollTo('agents')} className="text-text-muted hover:text-text-primary text-sm text-left bg-transparent p-0">Agents</button>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={toggleTheme}
              className="text-text-muted hover:text-text-primary bg-transparent p-1.5 rounded-lg hover:bg-surface transition-all"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <span className="text-text-muted text-sm">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </div>
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            {isAuthenticated ? (
              <>
                <Link to="/simulate" onClick={() => setMobileOpen(false)} className="text-text-secondary text-sm no-underline">My Simulations</Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="text-text-muted text-sm text-left bg-transparent p-0">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-text-secondary text-sm no-underline">Log in</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="bg-cta text-white text-sm font-semibold px-5 py-2 rounded-lg text-center no-underline">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
