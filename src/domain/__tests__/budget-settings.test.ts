import { resolvePendingRenewalDay } from '@/domain/budget-settings';

describe('resolvePendingRenewalDay', () => {
  it('defers a different renewal day and clears a change back to the active day', () => {
    expect(resolvePendingRenewalDay(5, 10)).toBe(10);
    expect(resolvePendingRenewalDay(5, 5)).toBeNull();
  });
});
