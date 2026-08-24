import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { initializeBudget } from '@/application/initialize-budget';
import { ensureActiveBudgetPeriod } from '@/application/ensure-active-budget-period';
import { getDatabase } from '@/data/database/client';
import { SqliteBudgetPeriodRepository, SqliteSettingsRepository, SqliteTransactionRepository } from '@/data/repositories/sqlite-repositories';
import type { BudgetPeriod, ExpenseTransaction } from '@/domain/entities';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';
import { ExpenseFormScreen } from '@/features/expenses/expense-form-screen';
import { type PeriodHistoryItem, HistoryScreen } from '@/features/history/history-screen';
import { BudgetSetupScreen } from '@/features/setup/budget-setup-screen';
import { useAppStore } from '@/state/app-store';

interface DashboardData {
  period: BudgetPeriod;
  expenses: ExpenseTransaction[];
  spentCents: number;
}

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'setup' }
  | { kind: 'dashboard'; data: DashboardData }
  | { kind: 'add-expense'; period: BudgetPeriod }
  | { kind: 'edit-expense'; expense: ExpenseTransaction }
  | { kind: 'history'; items: PeriodHistoryItem[] }
  | { kind: 'error'; message: string };

export default function IndexScreen() {
  const databaseStatus = useAppStore((state) => state.databaseStatus);
  const databaseError = useAppStore((state) => state.databaseError);
  const [screen, setScreen] = useState<ScreenState>({ kind: 'loading' });

  async function loadDashboard() {
    const database = await getDatabase();
    const period = await ensureActiveBudgetPeriod(database);
    if (!period) {
      setScreen({ kind: 'setup' });
      return;
    }
    const transactions = new SqliteTransactionRepository(database);
    const [expenses, spentCents] = await Promise.all([transactions.listByPeriod(period.id), transactions.sumByPeriod(period.id)]);
    setScreen({ kind: 'dashboard', data: { period, expenses, spentCents } });
  }

  useEffect(() => {
    if (databaseStatus !== 'ready') return;
    let active = true;
    getDatabase().then(async (database) => {
      const settings = await new SqliteSettingsRepository(database).get();
      if (!active) return;
      if (!settings) {
        setScreen({ kind: 'setup' });
        return;
      }
      await loadDashboard();
    })
      .catch((error: unknown) => {
        if (active) setScreen({ kind: 'error', message: error instanceof Error ? error.message : 'Não foi possível carregar seu orçamento.' });
      });
    return () => { active = false; };
  }, [databaseStatus]);

  if (databaseStatus === 'ready' && screen.kind === 'setup') {
    return <BudgetSetupScreen onSubmit={async (input) => {
      const result = await initializeBudget(await getDatabase(), input);
      setScreen({ kind: 'dashboard', data: { period: result.initialPeriod, expenses: [], spentCents: 0 } });
    }} />;
  }

  if (databaseStatus === 'ready' && screen.kind === 'dashboard') {
    const { data } = screen;
    return <DashboardScreen
      expenses={data.expenses}
      onAddExpense={() => setScreen({ kind: 'add-expense', period: data.period })}
      onEditExpense={(expense) => setScreen({ kind: 'edit-expense', expense })}
      onOpenHistory={async () => {
        const database = await getDatabase();
        const periods = await new SqliteBudgetPeriodRepository(database).list();
        const transactions = new SqliteTransactionRepository(database);
        const items = await Promise.all(periods.map(async (period) => ({ period, spentCents: await transactions.sumByPeriod(period.id) })));
        setScreen({ kind: 'history', items });
      }}
      period={data.period}
      spentCents={data.spentCents}
    />;
  }

  if (databaseStatus === 'ready' && screen.kind === 'add-expense') {
    return <ExpenseFormScreen
      onBack={() => { void loadDashboard(); }}
      onSubmit={async (input) => {
        const database = await getDatabase();
        await new SqliteTransactionRepository(database).create(screen.period.id, { ...input, occurredAt: new Date().toISOString() });
        await loadDashboard();
      }}
    />;
  }

  if (databaseStatus === 'ready' && screen.kind === 'edit-expense') {
    return <ExpenseFormScreen
      expense={screen.expense}
      onBack={() => { void loadDashboard(); }}
      onDelete={async () => {
        await new SqliteTransactionRepository(await getDatabase()).delete(screen.expense.id);
        await loadDashboard();
      }}
      onSubmit={async (input) => {
        await new SqliteTransactionRepository(await getDatabase()).update(screen.expense.id, input);
        await loadDashboard();
      }}
    />;
  }

  if (databaseStatus === 'ready' && screen.kind === 'history') {
    return <HistoryScreen items={screen.items} onBack={() => { void loadDashboard(); }} />;
  }

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1 justify-center px-6">
        <View className="rounded-3xl border border-prisma-100 bg-surface p-6">
          <Text accessibilityRole="header" className="text-3xl font-bold text-prisma-700">PRISMA</Text>
          <Text className="mt-3 text-xl font-semibold text-ink">Preparando seu orçamento</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Seus dados ficam somente neste aparelho.
          </Text>
          {(databaseStatus === 'loading' || databaseStatus === 'idle') && (
            <View className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator color="#0FAF9E" />
              <Text className="text-sm text-muted">Preparando os dados locais…</Text>
            </View>
          )}
          {databaseStatus === 'ready' && (
            <Text className="mt-6 text-sm font-semibold text-prisma-700">Dados locais prontos.</Text>
          )}
          {databaseStatus === 'error' && (
            <Text className="mt-6 text-sm font-semibold text-danger">{databaseError}</Text>
          )}
          {screen.kind === 'error' && <Text className="mt-6 text-sm font-semibold text-danger">{screen.message}</Text>}
        </View>
      </SafeAreaView>
    </View>
  );
}
