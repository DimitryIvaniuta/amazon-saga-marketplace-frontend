import { productSchema, tokenResponseSchema } from './schemas';

const product = {
  id: '10000000-0000-0000-0000-000000000001',
  name: 'Premium T-Shirt',
  description: 'Organic cotton',
  category: 'Clothing',
  active: true,
  variants: [{
    id: '20000000-0000-0000-0000-000000000001',
    skuCode: 'TSHIRT-M',
    attributes: { size: 'M' },
    priceMinor: 7999,
    currency: 'PLN',
    active: true,
  }],
  createdAt: '2026-06-21T08:00:00Z',
};

describe('API response schemas', () => {
  it('accepts a valid product contract', () => {
    expect(productSchema.parse(product)).toEqual(product);
  });

  it('rejects invalid money and identifiers', () => {
    const result = productSchema.safeParse({ ...product, id: 'not-a-uuid', variants: [{ ...product.variants[0], priceMinor: -1 }] });
    expect(result.success).toBe(false);
  });

  it('requires a valid token expiry timestamp', () => {
    expect(tokenResponseSchema.safeParse({ accessToken: 'token', tokenType: 'Bearer', expiresAt: 'tomorrow', roles: [] }).success).toBe(false);
  });
});
