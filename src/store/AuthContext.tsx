import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  username: null,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    return authStatus === 'true';
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('lastUsername') || '';
  });

  const login = (username: string, password: string) => {
    const validUsername = import.meta.env.VITE_AUTH_USERNAME || 'admin';
    const validPassword = import.meta.env.VITE_AUTH_PASSWORD || 'password123';

    // Store username regardless of login success
    localStorage.setItem('lastUsername', username);
    setUsername(username);

    if (username === validUsername && password === validPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    // Don't clear username on logout so it persists
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 