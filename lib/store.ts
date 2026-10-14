"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  recent: string[];
  track: (slug: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      commandOpen: false,
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
      recent: [],
      track: (slug) =>
        set((state) => ({
          recent: [slug, ...state.recent.filter((item) => item !== slug)].slice(0, 8),
        })),
    }),
    {
      name: "omnitoolbox",
      partialize: (state) => ({ recent: state.recent }),
    },
  ),
);
