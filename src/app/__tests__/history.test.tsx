import { AccessibilityInfo } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import HistoryRoute from '@/app/history';
import { loadPeriodHistory } from '@/application/dashboard-data';
import { getDatabase } from '@/data/database/client';
import { useAppStore } from '@/state/app-store';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react') as typeof import('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
    useRouter: () => ({ back: jest.fn(), canGoBack: () => true, push: jest.fn(), replace: jest.fn() }),
  };
});

jest.mock('@/data/database/client', () => ({ getDatabase: jest.fn() }));
jest.mock('@/application/dashboard-data', () => ({ loadPeriodHistory: jest.fn() }));
jest.mock('@/features/history/history-screen', () => ({ HistoryScreen: () => null }));

describe('HistoryRoute', () => {
  beforeEach(() => {
    jest.mocked(getDatabase).mockResolvedValue({} as never);
    jest.mocked(loadPeriodHistory).mockResolvedValue([]);
    useAppStore.setState({ pendingAnnouncement: 'Despesa atualizada.' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    useAppStore.setState({ pendingAnnouncement: null });
  });

  it('announces a completed edit after the refreshed history is displayed', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(jest.fn());

    await render(<HistoryRoute />);

    await waitFor(() => expect(loadPeriodHistory).toHaveBeenCalled());
    await waitFor(() => expect(announce).toHaveBeenCalledWith('Despesa atualizada.'), { timeout: 1_000 });
    expect(useAppStore.getState().pendingAnnouncement).toBeNull();
  });
});
