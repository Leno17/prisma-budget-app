import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import type { AppSettings } from '@/domain/entities';
import { BudgetSettingsScreen } from '@/features/settings/budget-settings-screen';

jest.mock('@/shared/accessibility/use-screen-reader-focus', () => ({
  useScreenReaderFocus: () => ({ current: null }),
  useScreenReaderFocusWhen: () => ({ current: null }),
}));

const settings: AppSettings = {
  id: 1,
  defaultLimitCents: 300_000,
  renewalDay: 5,
  pendingRenewalDay: null,
  currencyCode: 'BRL',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
};

describe('BudgetSettingsScreen local-data deletion', () => {
  afterEach(() => jest.restoreAllMocks());

  it('requires explicit destructive confirmation before deleting', async () => {
    let buttons: Parameters<typeof Alert.alert>[2];
    const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, alertButtons) => {
      buttons = alertButtons;
    });
    const onDeleteAllData = jest.fn().mockResolvedValue(undefined);
    const { getByRole } = await render(
      <BudgetSettingsScreen
        onBack={jest.fn()}
        onDeleteAllData={onDeleteAllData}
        onSubmit={jest.fn().mockResolvedValue(undefined)}
        settings={settings}
      />,
    );

    await fireEvent.press(getByRole('button', { name: 'Apagar todos os dados' }));

    expect(onDeleteAllData).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      'Apagar todos os dados do Prisma?',
      expect.stringContaining('Essa ação não pode ser desfeita.'),
      expect.any(Array),
    );
    expect(buttons?.find((button) => button.text === 'Cancelar')?.style).toBe('cancel');
    const destructiveButton = buttons?.find((button) => button.text === 'Apagar dados');
    expect(destructiveButton?.style).toBe('destructive');

    await act(async () => {
      await (destructiveButton?.onPress as () => Promise<void>)();
    });

    await waitFor(() => {
      expect(onDeleteAllData).toHaveBeenCalledTimes(1);
      expect(getByRole('button', { name: 'Apagar todos os dados' })).toBeEnabled();
    });
  });

  it('announces a deletion failure and keeps the screen available', async () => {
    let buttons: Parameters<typeof Alert.alert>[2];
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, alertButtons) => {
      buttons = alertButtons;
    });
    const onDeleteAllData = jest.fn().mockRejectedValue(new Error('Falha controlada ao apagar os dados.'));
    const { getByRole } = await render(
      <BudgetSettingsScreen
        onBack={jest.fn()}
        onDeleteAllData={onDeleteAllData}
        onSubmit={jest.fn().mockResolvedValue(undefined)}
        settings={settings}
      />,
    );

    await fireEvent.press(getByRole('button', { name: 'Apagar todos os dados' }));
    const destructiveButton = buttons?.find((button) => button.text === 'Apagar dados');

    await act(async () => {
      await (destructiveButton?.onPress as () => Promise<void>)();
    });

    await waitFor(() => expect(getByRole('alert')).toHaveTextContent('Falha controlada ao apagar os dados.'));
    expect(getByRole('button', { name: 'Apagar todos os dados' })).toBeEnabled();
  });
});
