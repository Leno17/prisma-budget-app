import type { SQLiteDatabase } from 'expo-sqlite';

import { deleteAllLocalData } from '@/application/delete-local-data';

interface FakeUserData {
  settings: string[];
  periods: string[];
  transactions: string[];
}

class FakeDeleteDatabase {
  executedStatements: string[] = [];
  failWhenStatementEquals: string | null = null;
  userData: FakeUserData = {
    settings: ['settings-1'],
    periods: ['period-1', 'period-2'],
    transactions: ['transaction-1', 'transaction-2'],
  };

  async execAsync(statement: string): Promise<void> {
    this.executedStatements.push(statement);
    this.maybeFail(statement);
  }

  async runAsync(statement: string): Promise<void> {
    this.executedStatements.push(statement);
    this.maybeFail(statement);

    if (statement === 'DELETE FROM transactions') this.userData.transactions = [];
    if (statement === 'DELETE FROM budget_periods') this.userData.periods = [];
    if (statement === 'DELETE FROM app_settings') this.userData.settings = [];
  }

  async withExclusiveTransactionAsync(task: (transaction: FakeDeleteDatabase) => Promise<void>): Promise<void> {
    const snapshot = structuredClone(this.userData);
    try {
      await task(this);
    } catch (error) {
      this.userData = snapshot;
      throw error;
    }
  }

  private maybeFail(statement: string) {
    if (statement === this.failWhenStatementEquals) throw new Error('Delete failed');
  }
}

function asDatabase(database: FakeDeleteDatabase): SQLiteDatabase {
  return database as unknown as SQLiteDatabase;
}

describe('deleteAllLocalData', () => {
  it('securely deletes transactions, periods, and settings in foreign-key order', async () => {
    const database = new FakeDeleteDatabase();

    await deleteAllLocalData(asDatabase(database));

    expect(database.userData).toEqual({ settings: [], periods: [], transactions: [] });
    expect(database.executedStatements).toEqual([
      'PRAGMA wal_checkpoint(TRUNCATE)',
      'PRAGMA secure_delete = ON',
      'DELETE FROM transactions',
      'DELETE FROM budget_periods',
      'DELETE FROM app_settings',
    ]);
  });

  it('rolls back every deletion when any table cannot be cleared', async () => {
    const database = new FakeDeleteDatabase();
    const originalData = structuredClone(database.userData);
    database.failWhenStatementEquals = 'DELETE FROM budget_periods';

    await expect(deleteAllLocalData(asDatabase(database))).rejects.toThrow('Não foi possível apagar os dados locais. Tente novamente.');

    expect(database.userData).toEqual(originalData);
    expect(database.executedStatements).not.toContain('DELETE FROM app_settings');
  });
});
