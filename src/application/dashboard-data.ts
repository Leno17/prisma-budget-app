import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureActiveBudgetPeriod } from '@/application/ensure-active-budget-period';
import { SqliteBudgetPeriodRepository, SqliteTransactionRepository } from '@/data/repositories/sqlite-repositories';
import type { BudgetPeriod, ExpenseTransaction } from '@/domain/entities';
import { sumCents } from '@/domain/money';

export interface DashboardData {
  period: BudgetPeriod;
  expenses: ExpenseTransaction[];
  spentCents: number;
}

export interface PeriodHistoryItem {
  period: BudgetPeriod;
  expenses: ExpenseTransaction[];
  spentCents: number;
}

export async function loadDashboardData(database: SQLiteDatabase): Promise<DashboardData | null> {
  const period = await ensureActiveBudgetPeriod(database);
  if (!period) return null;

  const transactions = new SqliteTransactionRepository(database);
  const expenses = await transactions.listByPeriod(period.id);
  const spentCents = sumCents(expenses.map((expense) => expense.amountCents));

  return { period, expenses, spentCents };
}

export async function loadPeriodHistory(database: SQLiteDatabase): Promise<PeriodHistoryItem[]> {
  await ensureActiveBudgetPeriod(database);
  const periods = await new SqliteBudgetPeriodRepository(database).list();
  const transactions = new SqliteTransactionRepository(database);
  return Promise.all(periods.map(async (period) => {
    const expenses = await transactions.listByPeriod(period.id);
    const spentCents = sumCents(expenses.map((expense) => expense.amountCents));
    return { period, expenses, spentCents };
  }));
}
