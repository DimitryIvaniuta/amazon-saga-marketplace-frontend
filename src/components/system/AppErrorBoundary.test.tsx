import { render, screen } from '@testing-library/react';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenComponent(): never {
  throw new Error('render failed');
}

describe('AppErrorBoundary', () => {
  it('renders a safe recovery screen', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<AppErrorBoundary><BrokenComponent /></AppErrorBoundary>);
    expect(screen.getByRole('heading', { name: /could not render/i })).toBeVisible();
    expect(screen.getByText(/No purchase action was retried/i)).toBeVisible();
  });
});
