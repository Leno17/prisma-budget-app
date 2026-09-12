const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function assertValidCents(value: number, fieldName = 'Valor'): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${fieldName} deve ser um número inteiro de centavos maior ou igual a zero.`);
  }
  return value;
}

export function assertPositiveCents(value: number, fieldName = 'Valor'): number {
  assertValidCents(value, fieldName);
  if (value === 0) throw new Error(`${fieldName} deve ser maior que zero.`);
  return value;
}

export function sumCents(values: Iterable<number>, fieldName = 'Total gasto'): number {
  let total = 0;

  for (const value of values) {
    assertValidCents(value, fieldName);
    total += value;
    if (!Number.isSafeInteger(total)) {
      throw new Error(`${fieldName} excede o maior valor que o Prisma pode calcular com segurança.`);
    }
  }

  return total;
}

export function formatBrl(cents: number): string {
  if (!Number.isSafeInteger(cents)) {
    throw new Error('Valor monetário inválido para formatação.');
  }
  return brl.format(cents / 100);
}

export function calculateAvailableCents(limitCents: number, spentCents: number): number {
  assertPositiveCents(limitCents, 'Limite');
  assertValidCents(spentCents, 'Total gasto');
  return limitCents - spentCents;
}
