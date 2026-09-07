import type { SQLiteDatabase } from 'expo-sqlite';

import { migrateDatabase } from '@/data/database/migrations';

class FakeMigrationDatabase {
  appliedVersions: number[];
  executedStatements: string[] = [];
  failWhenStatementIncludes: string | null = null;

  constructor(appliedVersions: number[] = []) {
    this.appliedVersions = [...appliedVersions];
  }

  async execAsync(statement: string): Promise<void> {
    this.executedStatements.push(statement);
    if (this.failWhenStatementIncludes && statement.includes(this.failWhenStatementIncludes)) {
      throw new Error('Migration failed');
    }
  }

  async getAllAsync<T>(): Promise<T[]> {
    return this.appliedVersions.map((version) => ({ version }) as T);
  }

  async runAsync(_statement: string, version: number): Promise<void> {
    this.appliedVersions.push(version);
  }
}

function asDatabase(database: FakeMigrationDatabase): SQLiteDatabase {
  return database as unknown as SQLiteDatabase;
}

describe('migrateDatabase', () => {
  it('applies each pending migration exactly once', async () => {
    const database = new FakeMigrationDatabase();

    await migrateDatabase(asDatabase(database));
    await migrateDatabase(asDatabase(database));

    expect(database.appliedVersions).toEqual([1, 2, 3]);
    expect(database.executedStatements.filter((statement) => statement === 'BEGIN IMMEDIATE')).toHaveLength(3);
    expect(database.executedStatements.filter((statement) => statement === 'COMMIT')).toHaveLength(3);
    expect(database.executedStatements).toContain('ALTER TABLE app_settings ADD COLUMN pending_renewal_day INTEGER CHECK (pending_renewal_day BETWEEN 1 AND 31)');
    expect(database.executedStatements.some((statement) => statement.includes('validate_transaction_description_length_on_insert'))).toBe(true);
  });

  it('rolls back a failed pending migration without recording it as applied', async () => {
    const database = new FakeMigrationDatabase([1]);
    database.failWhenStatementIncludes = 'ALTER TABLE app_settings';

    await expect(migrateDatabase(asDatabase(database))).rejects.toThrow('Migration failed');

    expect(database.appliedVersions).toEqual([1]);
    expect(database.executedStatements).toContain('BEGIN IMMEDIATE');
    expect(database.executedStatements).toContain('ROLLBACK');
    expect(database.executedStatements).not.toContain('COMMIT');
  });
});
