import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role, User } from './types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  role: () => Role | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
      role: () => get().user?.role ?? null,
    }),
    { name: 'store-rating-auth' },
  ),
);

export function homePathForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'STORE_OWNER':
      return '/owner';
    default:
      return '/stores';
  }
}
