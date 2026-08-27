import { getBudgetStatus } from '@/features/dashboard/budget-status';

describe('getBudgetStatus', () => {
  it('reports a healthy budget with the remaining percentage', () => {
    expect(getBudgetStatus(300_000, 50_000)).toEqual({
      availablePercentage: 83,
      tone: 'healthy',
      label: 'Dentro do limite',
    });
  });

  it('warns when a quarter or less remains', () => {
    expect(getBudgetStatus(100_000, 75_000)).toEqual({
      availablePercentage: 25,
      tone: 'warning',
      label: 'Atenção ao orçamento',
    });
  });

  it('marks a fully used budget without showing negative progress', () => {
    expect(getBudgetStatus(100_000, 100_000)).toEqual({
      availablePercentage: 0,
      tone: 'limit-reached',
      label: 'Limite atingido',
    });
  });

  it('marks an overspent budget without allowing progress below zero', () => {
    expect(getBudgetStatus(100_000, 125_000)).toEqual({
      availablePercentage: 0,
      tone: 'exceeded',
      label: 'Limite excedido',
    });
  });
});
