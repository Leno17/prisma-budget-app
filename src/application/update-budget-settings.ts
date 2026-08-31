import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureActiveBudgetPeriod } from '@/application/ensure-active-budget-period';
import { assertRenewalDay } from '@/domain/budget-period';
import { resolvePendingRenewalDay } from '@/domain/budget-settings';
import type { AppSettings, BudgetPeriod } from '@/domain/entities';
import { assertPositiveCents } from '@/domain/money';

interface SettingsRow {
  id: 1;
  default_limit_cents: number;
  renewal_day: number;
  pending_renewal_day: number | null;
  currency_code: 'BRL';
  created_at: string;
  updated_at: string;
}

export interface UpdateBudgetSettingsInput {
  limitCents: number;
  renewalDay: number;
  now?: Date;
}

export interface UpdatedBudgetSettings {
  settings: AppSettings;
  activePeriod: BudgetPeriod;
}

export async function updateBudgetSettings(database: SQLiteDatabase, input: UpdateBudgetSettingsInput): Promise<UpdatedBudgetSettings> {
  assertPositiveCents(input.limitCents, 'O limite do período');
  assertRenewalDay(input.renewalDay);
  const now = input.now ?? new Date();
  const activePeriod = await ensureActiveBudgetPeriod(database, now);
  if (!activePeriod) throw new Error('Configure um orçamento antes de alterar suas configurações.');
  let updatedSettings: UpdatedBudgetSettings | null = null;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const currentSettings = await transaction.getFirstAsync<SettingsRow>('SELECT * FROM app_settings WHERE id = 1');
    if (!currentSettings) throw new Error('Não foi possível encontrar as configurações do orçamento.');

    const pendingRenewalDay = resolvePendingRenewalDay(currentSettings.renewal_day, input.renewalDay);
    const updatedAt = now.toISOString();

    await transaction.runAsync(
      'UPDATE app_settings SET default_limit_cents = ?, pending_renewal_day = ?, updated_at = ? WHERE id = 1',
      input.limitCents,
      pendingRenewalDay,
      updatedAt,
    );
    await transaction.runAsync(
      'UPDATE budget_periods SET limit_cents = ? WHERE id = ?',
      input.limitCents,
      activePeriod.id,
    );

    updatedSettings = {
      settings: {
        id: 1,
        defaultLimitCents: input.limitCents,
        renewalDay: currentSettings.renewal_day,
        pendingRenewalDay,
        currencyCode: currentSettings.currency_code,
        createdAt: currentSettings.created_at,
        updatedAt,
      },
      activePeriod: { ...activePeriod, limitCents: input.limitCents },
    };
  });

  if (!updatedSettings) throw new Error('Não foi possível atualizar as configurações do orçamento.');
  return updatedSettings;
}
