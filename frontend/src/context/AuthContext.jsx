import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

const COOKIE_OPTS = { expires: 7, sameSite: 'lax' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // false until the initial auth check completes — prevents route guards from
  // redirecting to /login before the /api/me rehydration has had a chance to run
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const userId = Cookies.get('userId');
    if (!userId) { setAuthReady(true); return; }

    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
        else Cookies.remove('userId');
      })
      .finally(() => setAuthReady(true));
  }, []);

  // Accepts the raw API response from login or register
  // (normalises userId → id so both endpoints work)
  const login = (apiData) => {
    const normalized = {
      id:       apiData.userId ?? apiData.id,
      username: apiData.username,
      email:    apiData.email,
      roles:    apiData.roles ?? [],
    };
    Cookies.set('userId', normalized.id, COOKIE_OPTS);
    setUser(normalized);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    Cookies.remove('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
