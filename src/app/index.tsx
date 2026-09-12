import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { appRoutes } from '@/navigation/routes';
import { getDatabase } from '@/data/database/client';
import { SqliteSettingsRepository } from '@/data/repositories/sqlite-repositories';
import { RouteStateScreen } from '@/shared/components/route-state-screen';
import { useAppStore } from '@/state/app-store';

export default function IndexScreen() {
  const router = useRouter();
  const databaseStatus = useAppStore((state) => state.databaseStatus);
  const databaseError = useAppStore((state) => state.databaseError);
  const retryDatabase = useAppStore((state) => state.retryDatabase);
  const [routingError, setRoutingError] = useState<string | null>(null);

  useEffect(() => {
    if (databaseStatus !== 'ready') return;
    let active = true;

    getDatabase()
      .then(async (database) => {
        const settings = await new SqliteSettingsRepository(database).get();
        if (!active) return;
        router.replace(settings ? appRoutes.dashboard : appRoutes.setup);
      })
      .catch((error: unknown) => {
        if (active) setRoutingError(error instanceof Error ? error.message : 'Não foi possível abrir seu orçamento.');
      });

    return () => { active = false; };
  }, [databaseStatus, router]);

  if (databaseStatus === 'error' || routingError) {
    return (
      <RouteStateScreen
        message={routingError ?? databaseError ?? 'Não foi possível abrir os dados locais.'}
        onRetry={() => {
          setRoutingError(null);
          retryDatabase();
        }}
        status="error"
        title="Não foi possível abrir o Prisma"
      />
    );
  }

  return <RouteStateScreen message="Preparando seus dados locais…" status="loading" title="Preparando seu orçamento" />;
}
