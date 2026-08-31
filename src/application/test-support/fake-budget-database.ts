interface FakeSettingsRow {
  id: 1;
  default_limit_cents: number;
  renewal_day: number;
  pending_renewal_day: number | null;
  currency_code: 'BRL';
  created_at: string;
  updated_at: string;
}

interface FakePeriodRow {
  id: string;
  starts_on: string;
  ends_on: string;
  limit_cents: number;
  created_at: string;
}

export class FakeBudgetDatabase {
  constructor(
    public settings: FakeSettingsRow | null,
    public periods: FakePeriodRow[],
  ) {}

  async withExclusiveTransactionAsync(task: (transaction: FakeBudgetDatabase) => Promise<void>): Promise<void> {
    await task(this);
  }

  async getFirstAsync<T>(query: string, ...parameters: unknown[]): Promise<T | null> {
    if (query.includes('FROM app_settings')) return this.settings ? ({ ...this.settings } as T) : null;

    if (query.includes('starts_on <= ? AND ends_on > ?')) {
      const [date] = parameters as [string];
      const period = this.periods
        .filter((item) => item.starts_on <= date && item.ends_on > date)
        .sort((left, right) => right.starts_on.localeCompare(left.starts_on))[0];
      return period ? ({ ...period } as T) : null;
    }

    if (query.includes('ORDER BY ends_on DESC')) {
      const period = [...this.periods].sort((left, right) => right.ends_on.localeCompare(left.ends_on))[0];
      return period ? ({ ...period } as T) : null;
    }

    throw new Error(`Unsupported query: ${query}`);
  }

  async runAsync(query: string, ...parameters: unknown[]): Promise<void> {
    if (query.startsWith('INSERT INTO budget_periods')) {
      const [id, startsOn, endsOn, limitCents, createdAt] = parameters as [string, string, string, number, string];
      this.periods.push({ id, starts_on: startsOn, ends_on: endsOn, limit_cents: limitCents, created_at: createdAt });
      return;
    }

    if (query.startsWith('UPDATE app_settings SET renewal_day')) {
      if (!this.settings) throw new Error('Missing settings');
      const [renewalDay, updatedAt] = parameters as [number, string];
      this.settings = { ...this.settings, renewal_day: renewalDay, pending_renewal_day: null, updated_at: updatedAt };
      return;
    }

    if (query.startsWith('UPDATE app_settings SET default_limit_cents')) {
      if (!this.settings) throw new Error('Missing settings');
      const [limitCents, pendingRenewalDay, updatedAt] = parameters as [number, number | null, string];
      this.settings = { ...this.settings, default_limit_cents: limitCents, pending_renewal_day: pendingRenewalDay, updated_at: updatedAt };
      return;
    }

    if (query.startsWith('UPDATE budget_periods SET limit_cents')) {
      const [limitCents, id] = parameters as [number, string];
      const period = this.periods.find((item) => item.id === id);
      if (!period) throw new Error('Missing period');
      period.limit_cents = limitCents;
      return;
    }

    throw new Error(`Unsupported query: ${query}`);
  }
}

export function createFakeSettings(overrides: Partial<FakeSettingsRow> = {}): FakeSettingsRow {
  return {
    id: 1,
    default_limit_cents: 300_000,
    renewal_day: 5,
    pending_renewal_day: null,
    currency_code: 'BRL',
    created_at: '2026-07-05T12:00:00.000Z',
    updated_at: '2026-07-05T12:00:00.000Z',
    ...overrides,
  };
}

export function createFakePeriod(overrides: Partial<FakePeriodRow> = {}): FakePeriodRow {
  return {
    id: 'period-1',
    starts_on: '2026-07-05',
    ends_on: '2026-08-05',
    limit_cents: 300_000,
    created_at: '2026-07-05T12:00:00.000Z',
    ...overrides,
  };
}
