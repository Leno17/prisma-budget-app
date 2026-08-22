import { getCurrentBudgetPeriod, getInitialBudgetPeriod } from '@/domain/budget-period';

describe('budget periods', () => {
  it('clamps a day 31 renewal to the last day of a short month', () => {
    expect(getCurrentBudgetPeriod(new Date(2026, 1, 15), 31)).toEqual({ startsOn: '2026-01-31', endsOn: '2026-02-28' });
  });

  it('starts the first period today and ends on the next renewal date', () => {
    expect(getInitialBudgetPeriod(new Date(2026, 7, 21), 28)).toEqual({ startsOn: '2026-08-21', endsOn: '2026-08-28' });
  });
});
