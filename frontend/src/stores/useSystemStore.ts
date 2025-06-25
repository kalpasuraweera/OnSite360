import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SystemState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: "bumblebee" | "halloween";
  setTheme: (theme: "bumblebee" | "halloween") => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      theme: "bumblebee",
      setTheme: (theme) => {
        set({ theme });
        // Update the data-theme attribute on the HTML element
        document.documentElement.setAttribute("data-theme", theme);
      },
    }),
    {
      name: "system-storage", // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
      onRehydrateStorage: () => (state) => {
        // Apply theme to DOM when store is rehydrated from localStorage
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    }
  )
);
