import { isUuid, recentOrderStorage } from './recentOrder';

const orderId = '50000000-0000-0000-0000-000000000001';

describe('recentOrderStorage', () => {
  it('stores and reads a validated order ID', () => {
    recentOrderStorage.write(orderId);
    expect(recentOrderStorage.read()).toBe(orderId);
  });

  it('removes corrupted values', () => {
    sessionStorage.setItem('atlas-marketplace.last-order-id', 'broken');
    expect(recentOrderStorage.read()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('validates UUIDs', () => {
    expect(isUuid(orderId)).toBe(true);
    expect(isUuid('order-1')).toBe(false);
  });
});
