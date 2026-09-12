import { fireEvent, render } from '@testing-library/react-native';

import IndexScreen from '@/app/index';
import { useAppStore } from '@/state/app-store';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/data/database/client', () => ({ getDatabase: jest.fn() }));

describe('IndexScreen database recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      databaseStatus: 'error',
      databaseError: 'Falha ao preparar os dados locais.',
      databaseRetryToken: 0,
    });
  });

  afterEach(() => {
    useAppStore.setState({
      databaseStatus: 'idle',
      databaseError: null,
      databaseRetryToken: 0,
    });
  });

  it('offers a retry action that starts a new database bootstrap attempt', async () => {
    const screen = await render(<IndexScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(useAppStore.getState()).toMatchObject({
      databaseStatus: 'idle',
      databaseError: null,
      databaseRetryToken: 1,
    });
  });
});
