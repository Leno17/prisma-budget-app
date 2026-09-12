import type { IsoDate } from './entities';

export interface PeriodRange { startsOn: IsoDate; endsOn: IsoDate; }

export function assertIsoDate(value: string, fieldName = 'Data'): asserts value is IsoDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`${fieldName} está em um formato inválido.`);

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(year, month - 1, day, 12);
  if (year < 1000 || parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    throw new Error(`${fieldName} não representa uma data válida.`);
  }
}

export function assertRenewalDay(renewalDay: number): void {
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
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new Error('A data do aparelho não é válida. Corrija-a e tente novamente.');
  }
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

export function getNextBudgetPeriod(previousPeriodEndsOn: IsoDate, renewalDay: number): PeriodRange {
  assertRenewalDay(renewalDay);
  assertIsoDate(previousPeriodEndsOn, 'A data final do período anterior');
  const [year, month, day] = previousPeriodEndsOn.split('-').map(Number);
  const startsOn = localDate(year, month - 1, day);
  const endsOn = localDate(startsOn.getFullYear(), startsOn.getMonth() + 1, renewalDay);
  return { startsOn: previousPeriodEndsOn, endsOn: asIsoDate(endsOn) };
}

/** Returns the final calendar day included in a period whose `endsOn` is exclusive. */
export function getInclusivePeriodEnd(endsOn: IsoDate): IsoDate {
  assertIsoDate(endsOn, 'A data final do período');
  const [year, month, day] = endsOn.split('-').map(Number);
  const inclusiveEnd = new Date(year, month - 1, day - 1, 12);
  return asIsoDate(inclusiveEnd);
}
