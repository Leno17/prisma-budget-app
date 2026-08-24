import { assertPositiveCents } from './money';

/** Converts common Brazilian currency input formats into integer centavos. */
export function parseBrlToCents(input: string): number {
  const normalized = input.replace(/R\$/gi, '').replace(/\s/g, '').trim();
  if (!normalized) throw new Error('Informe o limite mensal.');

  let integerPart: string;
  let decimalPart = '';

  if (normalized.includes(',')) {
    const [integer = '', ...decimalParts] = normalized.replace(/\./g, '').split(',');
    if (decimalParts.length > 1 || !/^\d*$/.test(integer) || !/^\d{0,2}$/.test(decimalParts[0] ?? '')) {
      throw new Error('Informe um valor válido, como 1500 ou 1.500,00.');
    }
    integerPart = integer;
    decimalPart = decimalParts[0] ?? '';
  } else {
    const dotDecimal = normalized.match(/^(\d+)\.(\d{1,2})$/);
    if (dotDecimal) {
      [, integerPart, decimalPart] = dotDecimal;
    } else {
      integerPart = normalized.replace(/\./g, '');
      if (!/^\d+$/.test(integerPart)) {
        throw new Error('Informe um valor válido, como 1500 ou 1.500,00.');
      }
    }
  }

  const reais = Number(integerPart || '0');
  const centavos = Number((decimalPart || '').padEnd(2, '0'));
  const value = reais * 100 + centavos;
  return assertPositiveCents(value, 'O limite mensal');
}
