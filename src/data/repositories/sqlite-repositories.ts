import type { SQLiteDatabase } from 'expo-sqlite';

import type { AppSettings, BudgetPeriod, EntityId, ExpenseTransaction, NewExpenseTransaction } from '@/domain/entities';
import type { BudgetPeriodRepository, SettingsRepository, TransactionRepository } from '@/domain/repositories';

interface SettingsRow {
  id: 1;
  default_limit_cents: number;
  renewal_day: number;
  pending_renewal_day: number | null;
  currency_code: 'BRL';
  created_at: string;
  updated_at: string;
}

interface PeriodRow {
  id: string;
  starts_on: string;
  ends_on: string;
  limit_cents: number;
  created_at: string;
}

interface TransactionRow {
  id: string;
  budget_period_id: string;
  amount_cents: number;
  description: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

const toSettings = (row: SettingsRow): AppSettings => ({
  id: row.id,
  defaultLimitCents: row.default_limit_cents,
  renewalDay: row.renewal_day,
  pendingRenewalDay: row.pending_renewal_day,
  currencyCode: row.currency_code,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toPeriod = (row: PeriodRow): BudgetPeriod => ({
  id: row.id,
  startsOn: row.starts_on,
  endsOn: row.ends_on,
  limitCents: row.limit_cents,
  createdAt: row.created_at,
});

const toTransaction = (row: TransactionRow): ExpenseTransaction => ({
  id: row.id,
  budgetPeriodId: row.budget_period_id,
  amountCents: row.amount_cents,
  description: row.description,
  occurredAt: row.occurred_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SqliteSettingsRepository implements SettingsRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async get(): Promise<AppSettings | null> {
    const row = await this.database.getFirstAsync<SettingsRow>('SELECT * FROM app_settings WHERE id = 1');
    return row ? toSettings(row) : null;
  }
}

export class SqliteBudgetPeriodRepository implements BudgetPeriodRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getById(id: EntityId): Promise<BudgetPeriod | null> {
    const row = await this.database.getFirstAsync<PeriodRow>('SELECT * FROM budget_periods WHERE id = ?', id);
    return row ? toPeriod(row) : null;
  }

  async getCurrent(now: Date): Promise<BudgetPeriod | null> {
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const row = await this.database.getFirstAsync<PeriodRow>(
      'SELECT * FROM budget_periods WHERE starts_on <= ? AND ends_on > ? ORDER BY starts_on DESC LIMIT 1',
      date,
      date,
    );
    return row ? toPeriod(row) : null;
  }

  async create(period: Omit<BudgetPeriod, 'id' | 'createdAt'>): Promise<BudgetPeriod> {
    const id = createId();
    const createdAt = new Date().toISOString();
    await this.database.runAsync(
      'INSERT INTO budget_periods (id, starts_on, ends_on, limit_cents, created_at) VALUES (?, ?, ?, ?, ?)',
      id,
      period.startsOn,
      period.endsOn,
      period.limitCents,
      createdAt,
    );
    return { id, createdAt, ...period };
  }

  async updateActiveLimit(id: EntityId, limitCents: number): Promise<BudgetPeriod> {
    await this.database.runAsync('UPDATE budget_periods SET limit_cents = ? WHERE id = ?', limitCents, id);
    const updated = await this.getById(id);
    if (!updated) throw new Error('Período orçamentário não encontrado.');
    return updated;
  }

  async list(): Promise<BudgetPeriod[]> {
    return (await this.database.getAllAsync<PeriodRow>('SELECT * FROM budget_periods ORDER BY starts_on DESC')).map(toPeriod);
  }
}

export class SqliteTransactionRepository implements TransactionRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  async getById(id: EntityId): Promise<ExpenseTransaction | null> {
    const row = await this.database.getFirstAsync<TransactionRow>('SELECT * FROM transactions WHERE id = ?', id);
    return row ? toTransaction(row) : null;
  }

  async create(periodId: EntityId, transaction: NewExpenseTransaction): Promise<ExpenseTransaction> {
    const id = createId();
    const now = new Date().toISOString();
    await this.database.runAsync(
      `INSERT INTO transactions (id, budget_period_id, amount_cents, description, occurred_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id, periodId, transaction.amountCents, transaction.description.trim(), transaction.occurredAt, now, now,
    );
    return { id, budgetPeriodId: periodId, ...transaction, description: transaction.description.trim(), createdAt: now, updatedAt: now };
  }

  async update(id: EntityId, transaction: Pick<NewExpenseTransaction, 'amountCents' | 'description'>): Promise<ExpenseTransaction> {
    const now = new Date().toISOString();
    await this.database.runAsync('UPDATE transactions SET amount_cents = ?, description = ?, updated_at = ? WHERE id = ?', transaction.amountCents, transaction.description.trim(), now, id);
    const row = await this.database.getFirstAsync<TransactionRow>('SELECT * FROM transactions WHERE id = ?', id);
    if (!row) throw new Error('Despesa não encontrada.');
    return toTransaction(row);
  }

  async delete(id: EntityId): Promise<void> {
    await this.database.runAsync('DELETE FROM transactions WHERE id = ?', id);
  }

  async listByPeriod(periodId: EntityId): Promise<ExpenseTransaction[]> {
    return (await this.database.getAllAsync<TransactionRow>('SELECT * FROM transactions WHERE budget_period_id = ? ORDER BY occurred_at DESC, created_at DESC', periodId)).map(toTransaction);
  }

  async sumByPeriod(periodId: EntityId): Promise<number> {
    const row = await this.database.getFirstAsync<{ total: number | null }>('SELECT SUM(amount_cents) AS total FROM transactions WHERE budget_period_id = ?', periodId);
    return row?.total ?? 0;
  }
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
