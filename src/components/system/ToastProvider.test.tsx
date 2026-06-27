import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from './ToastProvider';

function Trigger() {
  const { notify } = useToast();
  return <button onClick={() => notify('Stock updated', 'success')}>Notify</button>;
}

describe('ToastProvider', () => {
  it('announces and dismisses notifications', async () => {
    const user = userEvent.setup();
    render(<ToastProvider><Trigger /></ToastProvider>);
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toHaveTextContent('Stock updated');
    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Stock updated')).not.toBeInTheDocument();
  });
});
