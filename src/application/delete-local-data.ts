import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Removes every user-created record while preserving the database schema.
 *
 * The checkpoint clears older WAL frames before secure deletion overwrites the
 * records. The deletes run in foreign-key order inside one exclusive transaction,
 * so a failure cannot leave a partially reset budget.
 */
export async function deleteAllLocalData(database: SQLiteDatabase): Promise<void> {
  try {
    await database.execAsync('PRAGMA wal_checkpoint(TRUNCATE)');

    await database.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync('PRAGMA secure_delete = ON');
      await transaction.runAsync('DELETE FROM transactions');
      await transaction.runAsync('DELETE FROM budget_periods');
      await transaction.runAsync('DELETE FROM app_settings');
    });
  } catch {
    throw new Error('Não foi possível apagar os dados locais. Tente novamente.');
  }
}
