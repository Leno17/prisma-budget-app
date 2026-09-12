import { create } from 'zustand';

type DatabaseStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AppState {
  databaseStatus: DatabaseStatus;
  databaseError: string | null;
  databaseRetryToken: number;
  pendingAnnouncement: string | null;
  setDatabaseStatus: (status: DatabaseStatus) => void;
  setDatabaseError: (message: string) => void;
  retryDatabase: () => void;
  setPendingAnnouncement: (message: string) => void;
  takePendingAnnouncement: () => string | null;
}

export const useAppStore = create<AppState>()((set, get) => ({
  databaseStatus: 'idle',
  databaseError: null,
  databaseRetryToken: 0,
  pendingAnnouncement: null,
  setDatabaseStatus: (databaseStatus) => set({ databaseStatus, databaseError: null }),
  setDatabaseError: (databaseError) => set({ databaseStatus: 'error', databaseError }),
  retryDatabase: () => set((state) => ({
    databaseStatus: 'idle',
    databaseError: null,
    databaseRetryToken: state.databaseRetryToken + 1,
  })),
  setPendingAnnouncement: (pendingAnnouncement) => set({ pendingAnnouncement }),
  takePendingAnnouncement: () => {
    const pendingAnnouncement = get().pendingAnnouncement;
    set({ pendingAnnouncement: null });
    return pendingAnnouncement;
  },
}));
