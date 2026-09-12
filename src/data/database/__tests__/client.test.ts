import { getDatabase } from '@/data/database/client';

const mockOpenDatabaseAsync = jest.fn();
const mockMigrateDatabase = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: (...parameters: unknown[]) => mockOpenDatabaseAsync(...parameters),
}));

jest.mock('@/data/database/migrations', () => ({
  DATABASE_NAME: 'prisma.db',
  migrateDatabase: (...parameters: unknown[]) => mockMigrateDatabase(...parameters),
}));

describe('getDatabase', () => {
  it('closes a failed connection and allows initialization to be retried', async () => {
    const failedDatabase = { closeAsync: jest.fn().mockResolvedValue(undefined) };
    const readyDatabase = { closeAsync: jest.fn().mockResolvedValue(undefined) };
    mockOpenDatabaseAsync.mockResolvedValueOnce(failedDatabase).mockResolvedValueOnce(readyDatabase);
    mockMigrateDatabase.mockRejectedValueOnce(new Error('Migration failed')).mockResolvedValueOnce(undefined);

    await expect(getDatabase()).rejects.toThrow('Migration failed');
    await expect(getDatabase()).resolves.toBe(readyDatabase);

    expect(failedDatabase.closeAsync).toHaveBeenCalledTimes(1);
    expect(mockOpenDatabaseAsync).toHaveBeenCalledTimes(2);
    expect(mockMigrateDatabase).toHaveBeenCalledTimes(2);
  });
});
