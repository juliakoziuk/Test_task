import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, tokenStore, userStore } from '../services/api';
import type { AuthResponse, User } from '../types/quiz';

interface AuthState {
  user: User | null;
  /** false until the stored token (if any) has been checked */
  ready: boolean;
  signIn: (auth: AuthResponse) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      userStore.clear();
      setReady(true);
      return;
    }
    // show the cached user right away, then confirm it with the server
    const cached = userStore.get();
    if (cached) {
      setUser(cached);
      setReady(true);
    }
    authApi
      .me()
      .then((me) => {
        userStore.set(me);
        setUser(me);
      })
      .catch(() => {
        tokenStore.clear();
        userStore.clear();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback((auth: AuthResponse) => {
    tokenStore.set(auth);
    userStore.set(auth.user);
    setUser(auth.user);
  }, []);

  const signOut = useCallback(() => {
    // Revoke the session server-side; the local state is cleared regardless of the outcome.
    authApi.logout().catch(() => undefined);
    tokenStore.clear();
    userStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, signOut }), [user, ready, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
