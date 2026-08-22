import { calculateAvailableCents, formatBrl } from '@/domain/money';

describe('money', () => {
  it('formats integer cents as Brazilian currency', () => {
    expect(formatBrl(16000)).toBe('R$ 160,00');
  });

  it('keeps overspending visible as a negative available amount', () => {
    expect(calculateAvailableCents(10_000, 12_500)).toBe(-2_500);
  });
});
