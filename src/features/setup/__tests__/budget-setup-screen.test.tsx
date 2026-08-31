import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { BudgetSetupScreen } from '@/features/setup/budget-setup-screen';

describe('BudgetSetupScreen', () => {
  it('submits the selected renewal day and parsed budget limit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByRole } = await render(<BudgetSetupScreen onSubmit={onSubmit} />);

    await fireEvent.changeText(getByLabelText('Limite do período em reais'), '1.500,00');
    await fireEvent.press(getByRole('radio', { name: 'Dia 10' }));
    await fireEvent.press(getByRole('button', { name: 'Criar meu orçamento' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ limitCents: 150_000, renewalDay: 10 }));
  });

  it('announces validation errors when the limit is missing', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { getByRole } = await render(<BudgetSetupScreen onSubmit={onSubmit} />);

    await fireEvent.press(getByRole('button', { name: 'Criar meu orçamento' }));

    await waitFor(() => expect(getByRole('alert')).toHaveTextContent('Informe o limite do período.'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
