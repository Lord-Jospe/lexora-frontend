/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { login as loginService, register as registerService } from '../api/services/auth.service';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth.type';

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface AuthContextType {
  token:    string | null;
  user:     AuthResponse['user'] | null;
  login:    (data: LoginRequest)    => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout:   () => void;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token')
  );
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AuthResponse = await loginService(data);
    // Guarda el token en estado y en localStorage (persiste al recargar)
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('token', response.access_token);
    return response;
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: AuthResponse = await registerService(data);
    // Guarda el token en estado y en localStorage (persiste al recargar)
    setToken(response.access_token);
    localStorage.setItem('token', response.access_token);
    // Guarda el usuario recién creado en estado
    setUser(response.user);
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};