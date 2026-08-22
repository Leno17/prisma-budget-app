import { type PropsWithChildren, useEffect } from 'react';

import { getDatabase } from '@/data/database/client';
import { useAppStore } from '@/state/app-store';

export function DatabaseBootstrap({ children }: PropsWithChildren) {
  const setDatabaseStatus = useAppStore((state) => state.setDatabaseStatus);
  const setDatabaseError = useAppStore((state) => state.setDatabaseError);

  useEffect(() => {
    let mounted = true;
    setDatabaseStatus('loading');
    getDatabase()
      .then(() => { if (mounted) setDatabaseStatus('ready'); })
      .catch((error: unknown) => {
        if (mounted) setDatabaseError(error instanceof Error ? error.message : 'Não foi possível abrir os dados locais.');
      });
    return () => { mounted = false; };
  }, [setDatabaseError, setDatabaseStatus]);

  return children;
}
