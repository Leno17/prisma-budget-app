import { assertRenewalDay } from '@/domain/budget-period';

export function resolvePendingRenewalDay(currentRenewalDay: number, requestedRenewalDay: number): number | null {
  assertRenewalDay(currentRenewalDay);
  assertRenewalDay(requestedRenewalDay);
  return currentRenewalDay === requestedRenewalDay ? null : requestedRenewalDay;
}
