import { create } from "zustand";

interface SystemState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  theme: "bumblebee" | "halloween";
  setTheme: (theme: "bumblebee" | "halloween") => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: "bumblebee",
  setTheme: (theme) => set({ theme }),
}));
