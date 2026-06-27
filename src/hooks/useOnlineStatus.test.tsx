import { act, render, screen } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

function Status() {
  return <span>{useOnlineStatus() ? 'online' : 'offline'}</span>;
}

describe('useOnlineStatus', () => {
  it('reacts to browser connectivity changes', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    render(<Status />);
    expect(screen.getByText('online')).toBeVisible();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(screen.getByText('offline')).toBeVisible();
  });
});
