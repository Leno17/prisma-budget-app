import type { SQLiteDatabase } from 'expo-sqlite';

import { assertIsoDate, assertRenewalDay, getCurrentBudgetPeriod, getNextBudgetPeriod } from '@/domain/budget-period';
import type { BudgetPeriod } from '@/domain/entities';
import { assertPositiveCents } from '@/domain/money';

const MAX_PERIODS_PER_CATCH_UP = 1_200;

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
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    throw new Error('A data do aparelho não é válida. Corrija-a e tente novamente.');
  }
  const date = asLocalIsoDate(now);
  let resolvedPeriod: BudgetPeriod | null = null;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const settings = await transaction.getFirstAsync<SettingsRow>(
      'SELECT default_limit_cents, renewal_day, pending_renewal_day FROM app_settings WHERE id = 1',
    );
    if (!settings) return;

    assertPositiveCents(settings.default_limit_cents, 'O limite padrão salvo');
    assertRenewalDay(settings.renewal_day);
    if (settings.pending_renewal_day !== null) assertRenewalDay(settings.pending_renewal_day);

    const latestRow = await transaction.getFirstAsync<PeriodRow>('SELECT * FROM budget_periods ORDER BY ends_on DESC LIMIT 1');
    const latest = latestRow ? toPeriod(latestRow) : null;
    if (latest && date < latest.endsOn) {
      // Budget history is monotonic. A clock rollback must not reactivate an
      // older period or create a second timeline behind the newest period.
      resolvedPeriod = latest;
      return;
    }

    const effectiveRenewalDay = settings.pending_renewal_day ?? settings.renewal_day;
    const createdAt = now.toISOString();
    let range = latest
      ? getNextBudgetPeriod(latest.endsOn, effectiveRenewalDay)
      : getCurrentBudgetPeriod(now, effectiveRenewalDay);
    const missingRanges = [];

    do {
      if (missingRanges.length >= MAX_PERIODS_PER_CATCH_UP) {
        throw new Error('A data do aparelho está muito distante do último período salvo. Corrija-a e tente novamente.');
      }
      missingRanges.push(range);
      range = getNextBudgetPeriod(range.endsOn, effectiveRenewalDay);
    } while (missingRanges[missingRanges.length - 1].endsOn <= date);

    let activePeriod: BudgetPeriod | null = null;
    for (const missingRange of missingRanges) {
      activePeriod = {
        id: createId(),
        ...missingRange,
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
    }

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
  assertIsoDate(row.starts_on, 'A data inicial salva do período');
  assertIsoDate(row.ends_on, 'A data final salva do período');
  if (row.starts_on >= row.ends_on) throw new Error('O período salvo possui um intervalo de datas inválido.');
  assertPositiveCents(row.limit_cents, 'O limite salvo do período');
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
