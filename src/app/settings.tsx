import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { updateBudgetSettings } from '@/application/update-budget-settings';
import { getDatabase } from '@/data/database/client';
import { SqliteSettingsRepository } from '@/data/repositories/sqlite-repositories';
import type { AppSettings } from '@/domain/entities';
import { BudgetSettingsScreen } from '@/features/settings/budget-settings-screen';
import { appRoutes } from '@/navigation/routes';
import { RouteStateScreen } from '@/shared/components/route-state-screen';
import { useAppStore } from '@/state/app-store';

type SettingsRouteState =
  | { kind: 'loading' }
  | { kind: 'ready'; settings: AppSettings }
  | { kind: 'error'; message: string };

export default function SettingsRoute() {
  const router = useRouter();
  const setPendingAnnouncement = useAppStore((state) => state.setPendingAnnouncement);
  const [screen, setScreen] = useState<SettingsRouteState>({ kind: 'loading' });
  const [retryToken, setRetryToken] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    const requestToken = retryToken;

    getDatabase()
      .then((database) => new SqliteSettingsRepository(database).get())
      .then((settings) => {
        if (!active || requestToken !== retryToken) return;
        if (!settings) {
          router.replace(appRoutes.setup);
          return;
        }
        setScreen({ kind: 'ready', settings });
      })
      .catch((error: unknown) => {
        if (active && requestToken === retryToken) setScreen({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar as configurações.' });
      });

    return () => { active = false; };
  }, [retryToken, router]));

  if (screen.kind === 'loading') return <RouteStateScreen message="Carregando suas configurações…" status="loading" title="Preparando configurações" />;
  if (screen.kind === 'error') return <RouteStateScreen message={screen.message} onRetry={() => setRetryToken((value) => value + 1)} status="error" title="Não foi possível abrir as configurações" />;

  return (
    <BudgetSettingsScreen
      onBack={() => goBackToDashboard(router)}
      onSubmit={async (input) => {
        const updated = await updateBudgetSettings(await getDatabase(), input);
        const renewalNote = updated.settings.pendingRenewalDay === null
          ? ''
          : ` O dia ${updated.settings.pendingRenewalDay} será aplicado no próximo período.`;
        setPendingAnnouncement(`Orçamento atualizado. O novo limite já está valendo.${renewalNote}`);
        goBackToDashboard(router);
      }}
      settings={screen.settings}
    />
  );
}

function goBackToDashboard(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) router.back();
  else router.replace(appRoutes.dashboard);
}
