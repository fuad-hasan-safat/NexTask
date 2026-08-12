import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRefreshToken, clearTokens } from "../lib/tokens";
import { logoutApi } from "../api/authApi";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        // Best-effort server-side revocation of the refresh token; the local
        // session is cleared regardless of whether the request succeeds.
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          logoutApi(refreshToken).catch(() => {});
        }
        clearTokens();
        set({ user: null });
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user })
    }
  )
);
