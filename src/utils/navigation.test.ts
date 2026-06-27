import { safeInternalPath } from './navigation';

describe('safeInternalPath', () => {
  it('allows internal application paths', () => {
    expect(safeInternalPath('/orders/123?view=full')).toBe('/orders/123?view=full');
  });

  it('rejects external and protocol-relative redirects', () => {
    expect(safeInternalPath('https://evil.example')).toBe('/');
    expect(safeInternalPath('//evil.example')).toBe('/');
  });
});
