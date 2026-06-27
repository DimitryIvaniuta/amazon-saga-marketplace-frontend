import type { CheckoutRequest } from '../api/types';
import { checkoutIdempotencyKey, completeCheckoutAttempt } from './idempotency';

const request: CheckoutRequest = {
  paymentToken: 'tok_success',
  shippingAddress: {
    recipient: 'Buyer',
    addressLine1: 'Main 1',
    city: 'Warsaw',
    postalCode: '00-001',
    country: 'PL',
  },
};

describe('checkout idempotency', () => {
  it('reuses a key only for an equivalent checkout payload', async () => {
    const first = await checkoutIdempotencyKey(request);
    expect(await checkoutIdempotencyKey({ ...request, shippingAddress: { ...request.shippingAddress } })).toBe(first);

    const changed = await checkoutIdempotencyKey({ ...request, shippingAddress: { ...request.shippingAddress, city: 'Gdansk' } });
    expect(changed).not.toBe(first);
  });

  it('creates a new key after successful completion', async () => {
    const first = await checkoutIdempotencyKey(request);
    completeCheckoutAttempt();
    expect(await checkoutIdempotencyKey(request)).not.toBe(first);
  });

  it('stores only a digest and never the payment token', async () => {
    await checkoutIdempotencyKey(request);
    const persisted = sessionStorage.getItem('atlas-marketplace.checkout-attempt');
    expect(persisted).not.toContain(request.paymentToken);
    expect(persisted).not.toContain(request.shippingAddress.addressLine1);
  });
});
