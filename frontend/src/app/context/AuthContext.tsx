import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, AuthUser } from '../api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [token, setToken]     = useState<string | null>(localStorage.getItem('ct_token'));
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('ct_token'));

  // On mount: if a token is stored, reload the user profile
  useEffect(() => {
    if (!token) return;
    api.users.me()
      .then((u) =>
        setUser({
          id:       u.id,
          username: u.username,
          // /users/me does not return email – keep it empty if unavailable
          email:    (u as any).email ?? '',
          level:    u.level,
          points:   u.points,
          isPublic: u.is_public,
          isAdmin:  u.is_admin,
        })
      )
      .catch(() => {
        localStorage.removeItem('ct_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('ct_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string) => {
    await api.auth.register({ username, email, password });
  };

  const logout = () => {
    localStorage.removeItem('ct_token');
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async () => {
    await api.auth.deleteAccount();
    logout();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
