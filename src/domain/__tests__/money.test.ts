import { calculateAvailableCents, formatBrl, sumCents } from '@/domain/money';

describe('money', () => {
  it('formats integer cents as Brazilian currency', () => {
    expect(formatBrl(16000)).toBe('R$ 160,00');
  });

  it('keeps overspending visible as a negative available amount', () => {
    expect(calculateAvailableCents(10_000, 12_500)).toBe(-2_500);
  });

  it('sums integer cents without allowing unsafe totals', () => {
    expect(sumCents([10_000, 2_500, 750])).toBe(13_250);
    expect(() => sumCents([Number.MAX_SAFE_INTEGER, 1])).toThrow('excede o maior valor');
  });

  it('rejects unsafe values before currency formatting', () => {
    expect(() => formatBrl(Number.MAX_SAFE_INTEGER + 1)).toThrow('Valor monetário inválido');
  });
});
