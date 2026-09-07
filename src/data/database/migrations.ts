import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'prisma.db';

interface Migration { version: number; statements: string[]; }

const migrations: Migration[] = [
  {
    version: 1,
    statements: [
    `CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      default_limit_cents INTEGER NOT NULL CHECK (default_limit_cents > 0),
      renewal_day INTEGER NOT NULL CHECK (renewal_day BETWEEN 1 AND 31),
      currency_code TEXT NOT NULL DEFAULT 'BRL' CHECK (currency_code = 'BRL'),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS budget_periods (
      id TEXT PRIMARY KEY NOT NULL,
      starts_on TEXT NOT NULL UNIQUE,
      ends_on TEXT NOT NULL,
      limit_cents INTEGER NOT NULL CHECK (limit_cents > 0),
      created_at TEXT NOT NULL,
      CHECK (starts_on < ends_on)
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      budget_period_id TEXT NOT NULL REFERENCES budget_periods(id) ON DELETE RESTRICT,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      description TEXT NOT NULL CHECK (length(trim(description)) > 0),
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    'CREATE INDEX IF NOT EXISTS idx_transactions_period_occurred_at ON transactions (budget_period_id, occurred_at DESC)',
    ],
  },
  {
    version: 2,
    statements: [
      'ALTER TABLE app_settings ADD COLUMN pending_renewal_day INTEGER CHECK (pending_renewal_day BETWEEN 1 AND 31)',
    ],
  },
  {
    version: 3,
    statements: [
      `CREATE TRIGGER IF NOT EXISTS validate_transaction_description_length_on_insert
       BEFORE INSERT ON transactions
       FOR EACH ROW WHEN length(trim(NEW.description)) > 100
       BEGIN
         SELECT RAISE(ABORT, 'A descrição da despesa deve ter no máximo 100 caracteres.');
       END`,
      `CREATE TRIGGER IF NOT EXISTS validate_transaction_description_length_on_update
       BEFORE UPDATE OF description ON transactions
       FOR EACH ROW WHEN length(trim(NEW.description)) > 100
       BEGIN
         SELECT RAISE(ABORT, 'A descrição da despesa deve ter no máximo 100 caracteres.');
       END`,
    ],
  },
];

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>('SELECT version FROM schema_migrations');
  const appliedVersions = new Set(applied.map(({ version }) => version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;
    await db.execAsync('BEGIN IMMEDIATE');
    try {
      for (const statement of migration.statements) await db.execAsync(statement);
      await db.runAsync('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)', migration.version, new Date().toISOString());
      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  }
}
