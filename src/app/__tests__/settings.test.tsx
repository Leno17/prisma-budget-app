import { act, render, waitFor } from '@testing-library/react-native';

import SettingsRoute from '@/app/settings';
import { deleteAllLocalData } from '@/application/delete-local-data';
import { getDatabase } from '@/data/database/client';

const mockRouter = {
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  dismissAll: jest.fn(),
  replace: jest.fn(),
};
let mockDeleteHandler: (() => Promise<void>) | undefined;

jest.mock('expo-router', () => {
  const React = jest.requireActual('react') as typeof import('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
    useRouter: () => mockRouter,
  };
});

jest.mock('@/data/database/client', () => ({ getDatabase: jest.fn() }));
jest.mock('@/application/delete-local-data', () => ({ deleteAllLocalData: jest.fn() }));
jest.mock('@/features/settings/budget-settings-screen', () => ({
  BudgetSettingsScreen: ({ onDeleteAllData }: { onDeleteAllData: () => Promise<void> }) => {
    mockDeleteHandler = onDeleteAllData;
    return null;
  },
}));

describe('SettingsRoute local-data deletion', () => {
  beforeEach(() => {
    mockDeleteHandler = undefined;
    jest.clearAllMocks();
    const database = {
      getFirstAsync: jest.fn().mockResolvedValue({
        id: 1,
        default_limit_cents: 300_000,
        renewal_day: 5,
        pending_renewal_day: null,
        currency_code: 'BRL',
        created_at: '2026-09-01T12:00:00.000Z',
        updated_at: '2026-09-01T12:00:00.000Z',
      }),
    };
    jest.mocked(getDatabase).mockResolvedValue(database as never);
    jest.mocked(deleteAllLocalData).mockResolvedValue(undefined);
  });

  it('clears navigation history and returns to setup after deletion', async () => {
    await render(<SettingsRoute />);
    await waitFor(() => expect(mockDeleteHandler).toBeDefined());

    await act(async () => {
      await mockDeleteHandler?.();
    });

    expect(deleteAllLocalData).toHaveBeenCalledWith(await getDatabase());
    expect(mockRouter.dismissAll).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith('/setup');
    expect(mockRouter.dismissAll.mock.invocationCallOrder[0]).toBeLessThan(mockRouter.replace.mock.invocationCallOrder[0]);
  });
});
