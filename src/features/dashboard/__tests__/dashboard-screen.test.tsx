import { fireEvent, render } from '@testing-library/react-native';

import type { BudgetPeriod } from '@/domain/entities';
import { DashboardScreen } from '@/features/dashboard/dashboard-screen';

const period: BudgetPeriod = {
  id: 'current-period',
  startsOn: '2026-09-05',
  endsOn: '2026-10-05',
  limitCents: 300_000,
  createdAt: '2026-09-05T12:00:00.000Z',
};

describe('DashboardScreen', () => {
  it('keeps history available when the active period has no expenses', async () => {
    const onOpenHistory = jest.fn();
    const { getByRole } = await render(
      <DashboardScreen
        expenses={[]}
        onAddExpense={jest.fn()}
        onEditExpense={jest.fn()}
        onOpenHistory={onOpenHistory}
        onOpenSettings={jest.fn()}
        period={period}
        spentCents={0}
      />,
    );

    fireEvent.press(getByRole('button', { name: 'Ver todas as despesas' }));

    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });
});
