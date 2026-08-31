import { useCallback, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { appRoutes } from '@/navigation/routes';
import { type DashboardData, loadDashboardData } from '@/application/dashboard-data';
import { getDatabase } from '@/data/database/client';
import { calculateAvailableCents, formatBrl } from '@/domain/money';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';
import { RouteStateScreen } from '@/shared/components/route-state-screen';
import { useAppStore } from '@/state/app-store';

type DashboardRouteState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: DashboardData }
  | { kind: 'error'; message: string };

export default function DashboardRoute() {
  const router = useRouter();
  const takePendingAnnouncement = useAppStore((state) => state.takePendingAnnouncement);
  const [screen, setScreen] = useState<DashboardRouteState>({ kind: 'loading' });
  const [retryToken, setRetryToken] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    let announcementTimer: ReturnType<typeof setTimeout> | undefined;
    const announcement = takePendingAnnouncement();
    const requestToken = retryToken;

    getDatabase()
      .then(loadDashboardData)
      .then((data) => {
        if (!active || requestToken !== retryToken) return;
        if (!data) {
          router.replace(appRoutes.setup);
          return;
        }
        setScreen({ kind: 'ready', data });
        if (announcement) {
          const availableCents = calculateAvailableCents(data.period.limitCents, data.spentCents);
          const budgetSummary = availableCents >= 0
            ? `${formatBrl(availableCents)} disponíveis neste período.`
            : `${formatBrl(Math.abs(availableCents))} acima do limite.`;
          announcementTimer = setTimeout(() => {
            if (active) AccessibilityInfo.announceForAccessibility(`${announcement} ${budgetSummary}`);
          }, 600);
        }
      })
      .catch((error: unknown) => {
        if (active && requestToken === retryToken) setScreen({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar seu orçamento.' });
      });

    return () => {
      active = false;
      if (announcementTimer) clearTimeout(announcementTimer);
    };
  }, [retryToken, router, takePendingAnnouncement]));

  if (screen.kind === 'loading') return <RouteStateScreen message="Carregando o período atual…" status="loading" title="Preparando seu orçamento" />;
  if (screen.kind === 'error') return <RouteStateScreen message={screen.message} onRetry={() => setRetryToken((value) => value + 1)} status="error" title="Não foi possível carregar seu orçamento" />;

  return (
    <DashboardScreen
      expenses={screen.data.expenses}
      onAddExpense={() => router.push(appRoutes.newExpense)}
      onEditExpense={(expense) => router.push(appRoutes.editExpense(expense.id))}
      onOpenHistory={() => router.push(appRoutes.history)}
      onOpenSettings={() => router.push(appRoutes.settings)}
      period={screen.data.period}
      spentCents={screen.data.spentCents}
    />
  );
}
