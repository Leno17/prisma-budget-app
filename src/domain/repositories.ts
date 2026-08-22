import type { AppSettings, BudgetPeriod, EntityId, ExpenseTransaction, NewExpenseTransaction } from './entities';

export interface SettingsRepository {
  get(): Promise<AppSettings | null>;
  save(settings: Pick<AppSettings, 'defaultLimitCents' | 'renewalDay'>): Promise<AppSettings>;
}

export interface BudgetPeriodRepository {
  getById(id: EntityId): Promise<BudgetPeriod | null>;
  getCurrent(now: Date): Promise<BudgetPeriod | null>;
  create(period: Omit<BudgetPeriod, 'id' | 'createdAt'>): Promise<BudgetPeriod>;
  updateActiveLimit(id: EntityId, limitCents: number): Promise<BudgetPeriod>;
  list(): Promise<BudgetPeriod[]>;
}

export interface TransactionRepository {
  create(periodId: EntityId, transaction: NewExpenseTransaction): Promise<ExpenseTransaction>;
  update(id: EntityId, transaction: Pick<NewExpenseTransaction, 'amountCents' | 'description'>): Promise<ExpenseTransaction>;
  delete(id: EntityId): Promise<void>;
  listByPeriod(periodId: EntityId): Promise<ExpenseTransaction[]>;
  sumByPeriod(periodId: EntityId): Promise<number>;
}
