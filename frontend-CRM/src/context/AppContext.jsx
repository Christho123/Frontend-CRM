import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

const AppContext = createContext(null);

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [user, setUserState] = useState(readStoredUser);
  const [accessToken, setAccessTokenState] = useState(() =>
    window.localStorage.getItem(TOKEN_KEY)
  );
  const [twoFaPending, setTwoFaPending] = useState(null);

  const setTokens = useCallback((access, refresh) => {
    if (access) {
      window.localStorage.setItem(TOKEN_KEY, access);
      setAccessTokenState(access);
    }
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  }, []);

  const setUser = useCallback((userData) => {
    setUserState(userData);
    if (userData) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.localStorage.removeItem(USER_KEY);
    setAccessTokenState(null);
    setUserState(null);
    setTwoFaPending(null);
  }, []);

  const isAuthenticated = !!accessToken;

  const value = {
    user,
    setUser,
    accessToken,
    setTokens,
    logout,
    isAuthenticated,
    twoFaPending,
    setTwoFaPending,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
}
