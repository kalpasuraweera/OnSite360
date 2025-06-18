/**
 * Authentication store using Zustand for state management.
 *
 * This store handles authentication-related state and operations including:
 * - User authentication status
 * - Login/logout functionality
 * - Token storage
 * - Error handling
 *
 * @remarks
 * Zustand is particularly helpful in this project because it:
 * - Provides a simple, lightweight state management solution
 * - Integrates easily with middleware (like persist for storage)
 * - Reduces boilerplate compared to Redux
 * - Maintains type safety with TypeScript
 * - Offers built-in persistence that automatically syncs with localStorage
 * - Allows component-level access to state without context providers
 *
 * The persist middleware automatically saves authentication state to localStorage,
 * enabling persistence between page refreshes and browser sessions.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import instance from "../api/axiosInstance";
import type { User } from "../types/database";
import { AxiosError } from "axios";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // Use the instance
          const response = await instance.post("/auth/login", {
            email,
            password,
          });

          const { user, accessToken, refreshToken } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response.data; // Return the response data for further processing if needed
        } catch (error) {
          const errorMessage =
            error instanceof AxiosError
              ? error?.response?.data.message
              : "Login failed";
          set({ error: errorMessage, isLoading: false });
          return Promise.reject(errorMessage);
        }
      },
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },
      setTokens: (accessToken: string, refreshToken?: string) => {
        set({ accessToken, refreshToken, isAuthenticated: true });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage", // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
