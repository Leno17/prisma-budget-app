import { render } from '@testing-library/react-native';

import type { PeriodHistoryItem } from '@/application/dashboard-data';
import { HistoryScreen } from '@/features/history/history-screen';

jest.mock('@/shared/accessibility/use-screen-reader-focus', () => ({
  useScreenReaderFocus: () => ({ current: null }),
}));

const item: PeriodHistoryItem = {
  period: {
    id: 'period-1',
    startsOn: '2026-09-05',
    endsOn: '2026-10-05',
    limitCents: 300_000,
    createdAt: '2026-09-05T12:00:00.000Z',
  },
  expenses: [],
  spentCents: 0,
};

describe('HistoryScreen', () => {
  it('shows an inclusive user-facing range for an exclusive stored period', async () => {
    const { getByRole, queryByText } = await render(
      <HistoryScreen items={[item]} onBack={jest.fn()} onEditExpense={jest.fn()} />,
    );

    expect(getByRole('header', { name: 'De 05 de set. de 2026 até 04 de out. de 2026' })).toBeTruthy();
    expect(queryByText(/05 de out\. de 2026/)).toBeNull();
  });
});
