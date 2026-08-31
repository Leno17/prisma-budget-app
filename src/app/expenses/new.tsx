import { useRouter } from 'expo-router';

import { appRoutes } from '@/navigation/routes';
import { ensureActiveBudgetPeriod } from '@/application/ensure-active-budget-period';
import { getDatabase } from '@/data/database/client';
import { SqliteTransactionRepository } from '@/data/repositories/sqlite-repositories';
import { ExpenseFormScreen } from '@/features/expenses/expense-form-screen';
import { useAppStore } from '@/state/app-store';

export default function NewExpenseRoute() {
  const router = useRouter();
  const setPendingAnnouncement = useAppStore((state) => state.setPendingAnnouncement);

  return (
    <ExpenseFormScreen
      onBack={() => goBackToDashboard(router)}
      onSubmit={async (input) => {
        const database = await getDatabase();
        const period = await ensureActiveBudgetPeriod(database);
        if (!period) throw new Error('Configure um orçamento antes de registrar uma despesa.');
        await new SqliteTransactionRepository(database).create(period.id, { ...input, occurredAt: new Date().toISOString() });
        setPendingAnnouncement('Despesa registrada.');
        goBackToDashboard(router);
      }}
    />
  );
}

function goBackToDashboard(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) router.back();
  else router.replace(appRoutes.dashboard);
}
