import { parseBrlToCents } from '@/domain/parse-money';

describe('parseBrlToCents', () => {
  it.each([
    ['1500', 150_000],
    ['1.500,50', 150_050],
    ['R$ 99,9', 9_990],
    ['99.90', 9_990],
  ])('parses %s', (input, expected) => {
    expect(parseBrlToCents(input)).toBe(expected);
  });

  it('rejects zero and malformed values', () => {
    expect(() => parseBrlToCents('0')).toThrow();
    expect(() => parseBrlToCents('1,234')).toThrow();
  });

  it('uses the supplied field name in validation messages', () => {
    expect(() => parseBrlToCents('', 'O valor da despesa')).toThrow('Informe o valor da despesa.');
  });
});
