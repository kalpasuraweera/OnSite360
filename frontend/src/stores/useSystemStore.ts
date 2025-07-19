import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SystemState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: "bumblebee" | "halloween";
  setTheme: (theme: "bumblebee" | "halloween") => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      sidebarOpen: window.innerWidth >= 1024, // Default closed on mobile
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => {
        const { isMobile } = get();
        // On mobile, always close sidebar after opening; on desktop, toggle normally
        set((s) => ({ sidebarOpen: isMobile ? !s.sidebarOpen : !s.sidebarOpen }));
      },
      theme: "bumblebee",
      setTheme: (theme) => {
        set({ theme });
        // Update the data-theme attribute on the HTML element
        document.documentElement.setAttribute("data-theme", theme);
      },
      isMobile: window.innerWidth < 1024,
      setIsMobile: (mobile) => {
        set({ isMobile: mobile });
        // Auto-close sidebar on mobile by default
        if (mobile) {
          set({ sidebarOpen: false });
        }
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
