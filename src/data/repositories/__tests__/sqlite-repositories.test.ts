import {
  SqliteBudgetPeriodRepository,
  SqliteSettingsRepository,
  SqliteTransactionRepository,
} from '@/data/repositories/sqlite-repositories';

describe('SQLite repository validation boundaries', () => {
  it('rejects an unsafe amount read from persisted transaction data', async () => {
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({
        id: 'expense-1',
        budget_period_id: 'period-1',
        amount_cents: Number.MAX_SAFE_INTEGER + 1,
        description: 'Conta de luz',
        occurred_at: '2026-09-08T12:00:00.000Z',
        created_at: '2026-09-08T12:00:00.000Z',
        updated_at: '2026-09-08T12:00:00.000Z',
      }),
    };

    await expect(new SqliteTransactionRepository(database as never).getById('expense-1'))
      .rejects.toThrow('número inteiro de centavos');
  });

  it('rejects invalid expense values before attempting a database write', async () => {
    const database = { runAsync: jest.fn() };

    await expect(new SqliteTransactionRepository(database as never).create('period-1', {
      amountCents: Number.NaN,
      description: 'Conta de luz',
      occurredAt: '2026-09-08T12:00:00.000Z',
    })).rejects.toThrow('número inteiro de centavos');

    expect(database.runAsync).not.toHaveBeenCalled();
  });

  it('rejects malformed persisted settings and period ranges', async () => {
    const settingsDatabase = {
      getFirstAsync: jest.fn().mockResolvedValue({
        id: 1,
        default_limit_cents: 300_000,
        renewal_day: 32,
        pending_renewal_day: null,
        currency_code: 'BRL',
        created_at: '2026-09-08T12:00:00.000Z',
        updated_at: '2026-09-08T12:00:00.000Z',
      }),
    };
    const periodDatabase = {
      getFirstAsync: jest.fn().mockResolvedValue({
        id: 'period-1',
        starts_on: '2026-09-10',
        ends_on: '2026-09-05',
        limit_cents: 300_000,
        created_at: '2026-09-08T12:00:00.000Z',
      }),
    };

    await expect(new SqliteSettingsRepository(settingsDatabase as never).get()).rejects.toThrow('entre 1 e 31');
    await expect(new SqliteBudgetPeriodRepository(periodDatabase as never).getById('period-1'))
      .rejects.toThrow('intervalo de datas inválido');
  });
});
