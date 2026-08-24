import type { SQLiteDatabase } from 'expo-sqlite';

import { getCurrentBudgetPeriod } from '@/domain/budget-period';
import type { BudgetPeriod } from '@/domain/entities';

export async function ensureActiveBudgetPeriod(database: SQLiteDatabase, now = new Date()): Promise<BudgetPeriod | null> {
  const settings = await database.getFirstAsync<{ renewal_day: number }>('SELECT renewal_day FROM app_settings WHERE id = 1');
  if (!settings) return null;

  const date = asLocalIsoDate(now);
  const current = await database.getFirstAsync<PeriodRow>(
    'SELECT * FROM budget_periods WHERE starts_on <= ? AND ends_on > ? ORDER BY starts_on DESC LIMIT 1', date, date,
  );
  if (current) return toPeriod(current);

  const range = getCurrentBudgetPeriod(now, settings.renewal_day);
  const period: BudgetPeriod = {
    id: createId(),
    ...range,
    limitCents: (await database.getFirstAsync<{ default_limit_cents: number }>('SELECT default_limit_cents FROM app_settings WHERE id = 1'))!.default_limit_cents,
    createdAt: now.toISOString(),
  };

  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT OR IGNORE INTO budget_periods (id, starts_on, ends_on, limit_cents, created_at) VALUES (?, ?, ?, ?, ?)',
      period.id, period.startsOn, period.endsOn, period.limitCents, period.createdAt,
    );
  });

  const saved = await database.getFirstAsync<PeriodRow>('SELECT * FROM budget_periods WHERE starts_on = ?', range.startsOn);
  if (!saved) throw new Error('Não foi possível preparar o período orçamentário.');
  return toPeriod(saved);
}

interface PeriodRow { id: string; starts_on: string; ends_on: string; limit_cents: number; created_at: string; }

function toPeriod(row: PeriodRow): BudgetPeriod {
  return { id: row.id, startsOn: row.starts_on, endsOn: row.ends_on, limitCents: row.limit_cents, createdAt: row.created_at };
}

function asLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
