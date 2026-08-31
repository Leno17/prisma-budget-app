import { useCallback, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { type PeriodHistoryItem, loadPeriodHistory } from '@/application/dashboard-data';
import { getDatabase } from '@/data/database/client';
import { HistoryScreen } from '@/features/history/history-screen';
import { appRoutes } from '@/navigation/routes';
import { RouteStateScreen } from '@/shared/components/route-state-screen';
import { useAppStore } from '@/state/app-store';

type HistoryRouteState =
  | { kind: 'loading' }
  | { kind: 'ready'; items: PeriodHistoryItem[] }
  | { kind: 'error'; message: string };

export default function HistoryRoute() {
  const router = useRouter();
  const takePendingAnnouncement = useAppStore((state) => state.takePendingAnnouncement);
  const [screen, setScreen] = useState<HistoryRouteState>({ kind: 'loading' });
  const [retryToken, setRetryToken] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    let announcementTimer: ReturnType<typeof setTimeout> | undefined;
    const announcement = takePendingAnnouncement();
    const requestToken = retryToken;
    getDatabase()
      .then(loadPeriodHistory)
      .then((items) => {
        if (!active || requestToken !== retryToken) return;
        setScreen({ kind: 'ready', items });
        if (announcement) {
          announcementTimer = setTimeout(() => {
            if (active) AccessibilityInfo.announceForAccessibility(announcement);
          }, 600);
        }
      })
      .catch((error: unknown) => {
        if (active && requestToken === retryToken) setScreen({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar o histórico.' });
      });
    return () => {
      active = false;
      if (announcementTimer) clearTimeout(announcementTimer);
    };
  }, [retryToken, takePendingAnnouncement]));

  if (screen.kind === 'loading') return <RouteStateScreen message="Carregando os períodos registrados…" status="loading" title="Carregando histórico" />;
  if (screen.kind === 'error') return <RouteStateScreen message={screen.message} onRetry={() => setRetryToken((value) => value + 1)} status="error" title="Não foi possível carregar o histórico" />;

  return (
    <HistoryScreen
      items={screen.items}
      onBack={() => {
        if (router.canGoBack()) router.back();
        else router.replace(appRoutes.dashboard);
      }}
      onEditExpense={(expenseId) => router.push(appRoutes.editExpense(expenseId))}
    />
  );
}
