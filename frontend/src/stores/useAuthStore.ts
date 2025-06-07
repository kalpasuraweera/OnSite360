
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

export interface User {
  id: string;
  email: string;
  name: string;
  // Add any other user properties you need
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // Use the instance
          const response = await instance.post("/api/auth/login", {
            email,
            password,
          });

          const { user, token } = response.data;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
          console.error("Login error:", error);
        }
      },

      logout: () => {

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage", // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
