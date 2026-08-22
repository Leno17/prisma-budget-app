import type { IsoDate } from './entities';

export interface PeriodRange { startsOn: IsoDate; endsOn: IsoDate; }

function assertRenewalDay(renewalDay: number): void {
  if (!Number.isInteger(renewalDay) || renewalDay < 1 || renewalDay > 31) {
    throw new Error('O dia de renovação deve estar entre 1 e 31.');
  }
}

function localDate(year: number, monthIndex: number, day: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDay), 12);
}

function asIsoDate(date: Date): IsoDate {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function getCurrentBudgetPeriod(referenceDate: Date, renewalDay: number): PeriodRange {
  assertRenewalDay(renewalDay);
  const reference = startOfLocalDay(referenceDate);
  const renewalThisMonth = localDate(reference.getFullYear(), reference.getMonth(), renewalDay);
  const startsOn = reference >= renewalThisMonth
    ? renewalThisMonth
    : localDate(reference.getFullYear(), reference.getMonth() - 1, renewalDay);
  const endsOn = localDate(startsOn.getFullYear(), startsOn.getMonth() + 1, renewalDay);
  return { startsOn: asIsoDate(startsOn), endsOn: asIsoDate(endsOn) };
}

export function getInitialBudgetPeriod(referenceDate: Date, renewalDay: number): PeriodRange {
  assertRenewalDay(renewalDay);
  const startsOn = startOfLocalDay(referenceDate);
  let endsOn = localDate(startsOn.getFullYear(), startsOn.getMonth(), renewalDay);
  if (endsOn <= startsOn) endsOn = localDate(startsOn.getFullYear(), startsOn.getMonth() + 1, renewalDay);
  return { startsOn: asIsoDate(startsOn), endsOn: asIsoDate(endsOn) };
}
