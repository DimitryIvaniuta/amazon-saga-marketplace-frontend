import { authStorage } from './authStorage';

const session = {
  accessToken: 'token',
  tokenType: 'Bearer',
  expiresAt: '2099-01-01T00:00:00Z',
  roles: ['CUSTOMER'],
  email: 'buyer@example.com',
};

describe('authStorage', () => {
  it('round-trips a valid session in tab-scoped storage', () => {
    authStorage.write(session);
    expect(authStorage.read()).toEqual(session);
  });

  it('removes an expired session', () => {
    authStorage.write({ ...session, expiresAt: '2000-01-01T00:00:00Z' });
    expect(authStorage.read()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('removes malformed values', () => {
    sessionStorage.setItem('atlas-marketplace.session', '{broken');
    expect(authStorage.read()).toBeNull();
  });
});
