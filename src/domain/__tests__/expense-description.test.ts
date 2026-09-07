import { MAX_EXPENSE_DESCRIPTION_LENGTH, normalizeExpenseDescription } from '@/domain/expense-description';

describe('normalizeExpenseDescription', () => {
  it('trims and accepts a description at the maximum length', () => {
    const description = ` ${'a'.repeat(MAX_EXPENSE_DESCRIPTION_LENGTH)} `;

    expect(normalizeExpenseDescription(description)).toHaveLength(MAX_EXPENSE_DESCRIPTION_LENGTH);
  });

  it('rejects a description longer than the maximum length', () => {
    expect(() => normalizeExpenseDescription('a'.repeat(MAX_EXPENSE_DESCRIPTION_LENGTH + 1)))
      .toThrow('A descrição da despesa deve ter no máximo 100 caracteres.');
  });
});
