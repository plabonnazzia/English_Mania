"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ token, user, hydrated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ token: null, user: null, hydrated: true });
  },

  hydrate: async () => {
    if (typeof window === "undefined") {
      set({ hydrated: true });
      return;
    }
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token) {
      set({ token: null, user: null, hydrated: true });
      return;
    }
    if (rawUser) {
      try {
        set({ token, user: JSON.parse(rawUser) as User });
      } catch {
        // ignore invalid JSON
      }
    }
    try {
      const res = await api.get<{ user: User }>("/api/auth/me");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      set({ token, user: res.data.user, hydrated: true });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null, hydrated: true });
    }
  },
}));
