import { useQueryClient } from '@tanstack/react-query';
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/endpoints';
import { authStorage, type AuthSession } from './authStorage';

interface AuthContextValue {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const MAX_TIMEOUT_MS = 2_147_000_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authStorage.read());
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    authStorage.clear();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const expire = () => logout();
    window.addEventListener('atlas:session-expired', expire);
    return () => window.removeEventListener('atlas:session-expired', expire);
  }, [logout]);

  useEffect(() => {
    if (!session) return undefined;
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    // Always expire through the timer callback. This avoids a synchronous state
    // transition inside the effect while still clearing already-expired sessions.
    const timeout = window.setTimeout(logout, Math.max(0, Math.min(remaining, MAX_TIMEOUT_MS)));
    return () => window.clearTimeout(timeout);
  }, [logout, session]);

  const login = useCallback(async (email: string, password: string) => {
    const token = await authApi.login({ email, password });
    const next = { ...token, email } satisfies AuthSession;
    queryClient.clear();
    authStorage.write(next);
    setSession(next);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthenticated: session !== null,
    isAdmin: session?.roles.some((role) => role === 'ADMIN' || role === 'ROLE_ADMIN') ?? false,
    login,
    logout,
  }), [login, logout, session]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
