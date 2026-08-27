import { render } from '@testing-library/react-native';

import { BudgetRemainingRing } from '@/features/dashboard/budget-remaining-ring';

describe('BudgetRemainingRing', () => {
  it('exposes the percentage and status as an accessible progress indicator', async () => {
    const { getByRole } = await render(
      <BudgetRemainingRing status={{ availablePercentage: 83, tone: 'healthy', label: 'Dentro do limite' }} />,
    );

    const ring = getByRole('progressbar');
    expect(ring.props.accessibilityLabel).toBe('83% do orçamento permanece disponível. Dentro do limite.');
    expect(ring.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 83 });
  });
});
