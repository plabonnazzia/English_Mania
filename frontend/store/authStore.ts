import { create } from "zustand";

// Phase 1 placeholder — full auth store (token, user, login/logout) in Phase 4.
interface AuthState {
  user: null;
  token: string | null;
}
export const useAuthStore = create<AuthState>(() => ({
  user: null,
  token: null,
}));
