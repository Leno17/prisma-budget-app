import { create } from 'zustand';

type DatabaseStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AppState {
  databaseStatus: DatabaseStatus;
  databaseError: string | null;
  setDatabaseStatus: (status: DatabaseStatus) => void;
  setDatabaseError: (message: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  databaseStatus: 'idle',
  databaseError: null,
  setDatabaseStatus: (databaseStatus) => set({ databaseStatus, databaseError: null }),
  setDatabaseError: (databaseError) => set({ databaseStatus: 'error', databaseError }),
}));
