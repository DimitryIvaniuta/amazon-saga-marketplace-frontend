import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthProvider } from './AuthProvider';
import { ProtectedRoute } from './RouteGuards';
import { authStorage } from './authStorage';

function renderRoutes() {
  return render(<QueryClientProvider client={new QueryClient()}><AuthProvider><MemoryRouter initialEntries={['/private']}><Routes><Route path="/login" element={<div>Login page</div>} /><Route element={<ProtectedRoute />}><Route path="/private" element={<div>Private page</div>} /></Route></Routes></MemoryRouter></AuthProvider></QueryClientProvider>);
}

describe('ProtectedRoute', () => {
  it('redirects guests to login', () => {
    renderRoutes();
    expect(screen.getByText('Login page')).toBeVisible();
  });

  it('renders content for a valid session', () => {
    authStorage.write({ accessToken: 'token', tokenType: 'Bearer', expiresAt: '2099-01-01T00:00:00Z', roles: ['CUSTOMER'], email: 'buyer@example.com' });
    renderRoutes();
    expect(screen.getByText('Private page')).toBeVisible();
  });
});
