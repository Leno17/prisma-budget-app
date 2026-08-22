export type EntityId = string;
export type IsoDate = string;
export type IsoDateTime = string;

export interface AppSettings {
  id: 1;
  defaultLimitCents: number;
  renewalDay: number;
  currencyCode: 'BRL';
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface BudgetPeriod {
  id: EntityId;
  startsOn: IsoDate;
  endsOn: IsoDate;
  limitCents: number;
  createdAt: IsoDateTime;
}

export interface ExpenseTransaction {
  id: EntityId;
  budgetPeriodId: EntityId;
  amountCents: number;
  description: string;
  occurredAt: IsoDateTime;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface NewExpenseTransaction {
  amountCents: number;
  description: string;
  occurredAt: IsoDateTime;
}
