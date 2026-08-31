import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { appRoutes } from '@/navigation/routes';
import { getDatabase } from '@/data/database/client';
import { SqliteTransactionRepository } from '@/data/repositories/sqlite-repositories';
import type { ExpenseTransaction } from '@/domain/entities';
import { ExpenseFormScreen } from '@/features/expenses/expense-form-screen';
import { RouteStateScreen } from '@/shared/components/route-state-screen';
import { useAppStore } from '@/state/app-store';

type EditExpenseRouteState =
  | { kind: 'loading' }
  | { kind: 'ready'; expense: ExpenseTransaction }
  | { kind: 'error'; message: string };

export default function EditExpenseRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const setPendingAnnouncement = useAppStore((state) => state.setPendingAnnouncement);
  const [screen, setScreen] = useState<EditExpenseRouteState>({ kind: 'loading' });
  const [retryToken, setRetryToken] = useState(0);
  const expenseId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    let active = true;
    if (expenseId) {
      getDatabase()
        .then((database) => new SqliteTransactionRepository(database).getById(expenseId))
        .then((expense) => {
          if (!active) return;
          if (!expense) setScreen({ kind: 'error', message: 'A despesa selecionada não foi encontrada.' });
          else setScreen({ kind: 'ready', expense });
        })
        .catch((error: unknown) => {
          if (active) setScreen({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar esta despesa.' });
        });
    }

    return () => { active = false; };
  }, [expenseId, retryToken]);

  if (!expenseId) return <RouteStateScreen message="A despesa selecionada não foi encontrada." status="error" title="Não foi possível abrir a despesa" />;
  if (screen.kind === 'loading') return <RouteStateScreen message="Carregando a despesa selecionada…" status="loading" title="Carregando despesa" />;
  if (screen.kind === 'error') return <RouteStateScreen message={screen.message} onRetry={() => setRetryToken((value) => value + 1)} status="error" title="Não foi possível abrir a despesa" />;

  return (
    <ExpenseFormScreen
      expense={screen.expense}
      onBack={() => goBackToDashboard(router)}
      onDelete={async () => {
        const database = await getDatabase();
        await new SqliteTransactionRepository(database).delete(screen.expense.id);
        setPendingAnnouncement('Despesa excluída.');
        goBackToDashboard(router);
      }}
      onSubmit={async (input) => {
        const database = await getDatabase();
        await new SqliteTransactionRepository(database).update(screen.expense.id, input);
        setPendingAnnouncement('Despesa atualizada.');
        goBackToDashboard(router);
      }}
    />
  );
}

function goBackToDashboard(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) router.back();
  else router.replace(appRoutes.dashboard);
}
