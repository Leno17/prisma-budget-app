import { ensureActiveBudgetPeriod } from '@/application/ensure-active-budget-period';
import { createFakePeriod, createFakeSettings, FakeBudgetDatabase } from '@/application/test-support/fake-budget-database';

describe('ensureActiveBudgetPeriod', () => {
  it('starts the next period on the old boundary and applies a pending renewal day only then', async () => {
    const database = new FakeBudgetDatabase(
      createFakeSettings({ pending_renewal_day: 10 }),
      [createFakePeriod()],
    );

    const activePeriod = await ensureActiveBudgetPeriod(database as never, new Date(2026, 7, 20, 12));

    expect(activePeriod).toMatchObject({ startsOn: '2026-08-05', endsOn: '2026-09-10', limitCents: 300_000 });
    expect(database.settings).toMatchObject({ renewal_day: 10, pending_renewal_day: null });
  });

  it('creates every missing period in sequence when the app was not opened for several periods', async () => {
    const database = new FakeBudgetDatabase(
      createFakeSettings({ renewal_day: 10 }),
      [createFakePeriod({ ends_on: '2026-09-10' })],
    );

    const activePeriod = await ensureActiveBudgetPeriod(database as never, new Date(2026, 10, 11, 12));

    expect(activePeriod).toMatchObject({ startsOn: '2026-11-10', endsOn: '2026-12-10' });
    expect(database.periods.map(({ starts_on, ends_on }) => [starts_on, ends_on])).toEqual([
      ['2026-07-05', '2026-09-10'],
      ['2026-09-10', '2026-10-10'],
      ['2026-10-10', '2026-11-10'],
      ['2026-11-10', '2026-12-10'],
    ]);
  });
});
