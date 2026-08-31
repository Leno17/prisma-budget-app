import type { SQLiteDatabase } from 'expo-sqlite';

import { getInitialBudgetPeriod } from '@/domain/budget-period';
import type { AppSettings, BudgetPeriod } from '@/domain/entities';
import { assertPositiveCents } from '@/domain/money';

export interface InitializeBudgetInput {
  limitCents: number;
  renewalDay: number;
  now?: Date;
}

export interface InitializedBudget {
  settings: AppSettings;
  initialPeriod: BudgetPeriod;
}

export async function initializeBudget(database: SQLiteDatabase, input: InitializeBudgetInput): Promise<InitializedBudget> {
  assertPositiveCents(input.limitCents, 'O limite mensal');
  if (!Number.isInteger(input.renewalDay) || input.renewalDay < 1 || input.renewalDay > 31) {
    throw new Error('Escolha um dia de renovação entre 1 e 31.');
  }

  const now = input.now ?? new Date();
  const range = getInitialBudgetPeriod(now, input.renewalDay);
  const createdAt = now.toISOString();
  const period: BudgetPeriod = {
    id: createId(),
    ...range,
    limitCents: input.limitCents,
    createdAt,
  };
  const settings: AppSettings = {
    id: 1,
    defaultLimitCents: input.limitCents,
    renewalDay: input.renewalDay,
    pendingRenewalDay: null,
    currencyCode: 'BRL',
    createdAt,
    updatedAt: createdAt,
  };

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const existing = await transaction.getFirstAsync<{ id: number }>('SELECT id FROM app_settings WHERE id = 1');
    if (existing) throw new Error('O orçamento já foi configurado neste aparelho.');

    await transaction.runAsync(
      'INSERT INTO app_settings (id, default_limit_cents, renewal_day, pending_renewal_day, created_at, updated_at) VALUES (1, ?, ?, NULL, ?, ?)',
      settings.defaultLimitCents, settings.renewalDay, settings.createdAt, settings.updatedAt,
    );
    await transaction.runAsync(
      'INSERT INTO budget_periods (id, starts_on, ends_on, limit_cents, created_at) VALUES (?, ?, ?, ?, ?)',
      period.id, period.startsOn, period.endsOn, period.limitCents, period.createdAt,
    );
  });

  return { settings, initialPeriod: period };
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
