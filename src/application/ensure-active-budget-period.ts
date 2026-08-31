import type { SQLiteDatabase } from 'expo-sqlite';

import { getCurrentBudgetPeriod, getNextBudgetPeriod } from '@/domain/budget-period';
import type { BudgetPeriod } from '@/domain/entities';

interface SettingsRow {
  default_limit_cents: number;
  renewal_day: number;
  pending_renewal_day: number | null;
}

interface PeriodRow {
  id: string;
  starts_on: string;
  ends_on: string;
  limit_cents: number;
  created_at: string;
}

export async function ensureActiveBudgetPeriod(database: SQLiteDatabase, now = new Date()): Promise<BudgetPeriod | null> {
  const date = asLocalIsoDate(now);
  let resolvedPeriod: BudgetPeriod | null = null;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const settings = await transaction.getFirstAsync<SettingsRow>(
      'SELECT default_limit_cents, renewal_day, pending_renewal_day FROM app_settings WHERE id = 1',
    );
    if (!settings) return;

    const current = await transaction.getFirstAsync<PeriodRow>(
      'SELECT * FROM budget_periods WHERE starts_on <= ? AND ends_on > ? ORDER BY starts_on DESC LIMIT 1',
      date,
      date,
    );
    if (current) {
      resolvedPeriod = toPeriod(current);
      return;
    }

    const latest = await transaction.getFirstAsync<PeriodRow>('SELECT * FROM budget_periods ORDER BY ends_on DESC LIMIT 1');
    const effectiveRenewalDay = settings.pending_renewal_day ?? settings.renewal_day;
    const createdAt = now.toISOString();
    let range = latest
      ? getNextBudgetPeriod(latest.ends_on, effectiveRenewalDay)
      : getCurrentBudgetPeriod(now, effectiveRenewalDay);
    let activePeriod: BudgetPeriod | null = null;

    do {
      activePeriod = {
        id: createId(),
        ...range,
        limitCents: settings.default_limit_cents,
        createdAt,
      };
      await transaction.runAsync(
        'INSERT INTO budget_periods (id, starts_on, ends_on, limit_cents, created_at) VALUES (?, ?, ?, ?, ?)',
        activePeriod.id,
        activePeriod.startsOn,
        activePeriod.endsOn,
        activePeriod.limitCents,
        activePeriod.createdAt,
      );
      range = getNextBudgetPeriod(activePeriod.endsOn, effectiveRenewalDay);
    } while (activePeriod.endsOn <= date);

    if (settings.pending_renewal_day !== null) {
      await transaction.runAsync(
        'UPDATE app_settings SET renewal_day = ?, pending_renewal_day = NULL, updated_at = ? WHERE id = 1',
        effectiveRenewalDay,
        createdAt,
      );
    }

    resolvedPeriod = activePeriod;
  });

  return resolvedPeriod;
}

function toPeriod(row: PeriodRow): BudgetPeriod {
  return {
    id: row.id,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    limitCents: row.limit_cents,
    createdAt: row.created_at,
  };
}

function asLocalIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
