import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No authentication token received');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    loginWithToken(token)
      .then(() => navigate(localStorage.getItem('startup_idea') ? '/simulate' : '/'))
      .catch(() => {
        setError('Authentication failed');
        setTimeout(() => navigate('/login'), 2000);
      });
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <img src={theme === 'dark' ? '/darkmodelogo.png' : '/lightmodelogo.png'} alt="StartupJudge" style={{ height: '56px' }} className="mx-auto mb-4" />
        {error ? (
          <p className="text-danger text-sm">{error}</p>
        ) : (
          <>
            <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary text-sm">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
