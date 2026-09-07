export const MAX_EXPENSE_DESCRIPTION_LENGTH = 100;

export function normalizeExpenseDescription(description: string): string {
  const normalized = description.trim();
  if (!normalized) throw new Error('Descreva esta despesa antes de continuar.');
  if (normalized.length > MAX_EXPENSE_DESCRIPTION_LENGTH) {
    throw new Error(`A descrição da despesa deve ter no máximo ${MAX_EXPENSE_DESCRIPTION_LENGTH} caracteres.`);
  }
  return normalized;
}
