import { formatRecentExpenseDate } from '@/features/dashboard/recent-expense-date';

describe('formatRecentExpenseDate', () => {
  const now = new Date(2026, 7, 26, 12);

  it.each([
    ['today', new Date(2026, 7, 26, 8).toISOString(), 'Hoje'],
    ['yesterday', new Date(2026, 7, 25, 8).toISOString(), 'Ontem'],
    ['a recent day', new Date(2026, 7, 24, 8).toISOString(), 'Há 2 dias'],
    ['an older date', new Date(2026, 7, 12, 8).toISOString(), '12 de ago.'],
  ])('formats %s', (_description, occurredAt, expected) => {
    expect(formatRecentExpenseDate(occurredAt, now)).toBe(expected);
  });
});
