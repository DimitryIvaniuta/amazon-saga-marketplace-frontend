import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('invokes the click handler', async () => {
    const click = vi.fn();
    render(<Button onClick={click}>Continue</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(click).toHaveBeenCalledOnce();
  });

  it('disables interaction while loading', () => {
    render(<Button loading>Continue</Button>);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });
});
