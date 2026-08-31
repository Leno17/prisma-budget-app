import { updateBudgetSettings } from '@/application/update-budget-settings';
import { createFakePeriod, createFakeSettings, FakeBudgetDatabase } from '@/application/test-support/fake-budget-database';

describe('updateBudgetSettings', () => {
  it('updates the active and future limit while deferring the renewal-day change', async () => {
    const database = new FakeBudgetDatabase(createFakeSettings(), [createFakePeriod({ starts_on: '2026-08-05', ends_on: '2026-09-05' })]);

    const result = await updateBudgetSettings(database as never, {
      limitCents: 450_000,
      renewalDay: 10,
      now: new Date(2026, 7, 21, 12),
    });

    expect(result.settings).toMatchObject({ defaultLimitCents: 450_000, renewalDay: 5, pendingRenewalDay: 10 });
    expect(result.activePeriod.limitCents).toBe(450_000);
    expect(database.settings).toMatchObject({ default_limit_cents: 450_000, renewal_day: 5, pending_renewal_day: 10 });
    expect(database.periods[0].limit_cents).toBe(450_000);
  });

  it('removes a pending renewal-day change when the current renewal day is selected again', async () => {
    const database = new FakeBudgetDatabase(
      createFakeSettings({ pending_renewal_day: 10 }),
      [createFakePeriod({ starts_on: '2026-08-05', ends_on: '2026-09-05' })],
    );

    const result = await updateBudgetSettings(database as never, {
      limitCents: 300_000,
      renewalDay: 5,
      now: new Date(2026, 7, 21, 12),
    });

    expect(result.settings.pendingRenewalDay).toBeNull();
    expect(database.settings?.pending_renewal_day).toBeNull();
  });
});
