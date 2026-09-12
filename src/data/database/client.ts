import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME, migrateDatabase } from './migrations';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openInitializedDatabase().catch((error: unknown) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function openInitializedDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  try {
    await migrateDatabase(database);
    return database;
  } catch (error) {
    try {
      await database.closeAsync();
    } catch {
      // The migration failure is more useful than a secondary close failure.
    }
    throw error;
  }
}
