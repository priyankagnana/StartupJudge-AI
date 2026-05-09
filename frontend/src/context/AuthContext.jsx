import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, getMe } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getMe(token)
      .then(({ user }) => {
        setUser(user);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async ({ name, email, password }) => {
    const data = await registerUser({ name, email, password });
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const loginWithToken = async (newToken) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    const { user: userData } = await getMe(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, loginWithToken, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
