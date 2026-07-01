import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth.types';

// ─── State ───────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Persisted slice ─────────────────────────────────────────

const initial: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// ─── Store ───────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initial,

      login: (token: string, user: User) =>
        set({ token, user, isAuthenticated: true }),

      logout: () => set({ ...initial }),

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'integritycam-auth',
      partialize: ({ token, user, isAuthenticated }) => ({
        token,
        user,
        isAuthenticated,
      }),
    },
  ),
);
