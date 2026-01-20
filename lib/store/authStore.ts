import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  nickname: string;
  [key: string]: unknown; // 다른 필드들도 있을 수 있음
}

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      user: null,
      setAccessToken: (token: string | null) => {
        set({
          accessToken: token,
          isAuthenticated: !!token,
        });
      },
      setUser: (user: User | null) => {
        set({ user });
      },
      logout: () => {
        set({
          accessToken: null,
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
