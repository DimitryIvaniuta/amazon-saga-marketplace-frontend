import type { Page, Route } from '@playwright/test';

export const product = {
  id: '10000000-0000-0000-0000-000000000001',
  name: 'Premium Cotton T-Shirt',
  description: 'Heavyweight organic cotton T-shirt.',
  category: 'Clothing',
  active: true,
  createdAt: '2026-06-01T10:00:00Z',
  variants: [
    { id: '20000000-0000-0000-0000-000000000001', skuCode: 'TSHIRT-BLK-M', attributes: { color: 'black', size: 'M' }, priceMinor: 7999, currency: 'PLN', active: true },
    { id: '20000000-0000-0000-0000-000000000002', skuCode: 'TSHIRT-BLK-L', attributes: { color: 'black', size: 'L' }, priceMinor: 7999, currency: 'PLN', active: true },
  ],
};

export async function installApiMocks(page: Page, role = 'CUSTOMER') {
  let cart = { cartId: '30000000-0000-0000-0000-000000000001', userId: '40000000-0000-0000-0000-000000000001', items: [] as Array<{ skuId: string; quantity: number; addedAt: string }>, updatedAt: '2026-06-20T10:00:00Z' };
  let orderReads = 0;
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === '/api/auth/login' && method === 'POST') return json(route, { accessToken: 'mock-jwt', tokenType: 'Bearer', expiresAt: '2099-01-01T00:00:00Z', roles: [role] });
    if (path === '/api/auth/register' && method === 'POST') return json(route, { userId: '40000000-0000-0000-0000-000000000001', email: 'buyer@example.com' }, 201);
    if (path === '/api/catalog/products' && method === 'GET') return json(route, [product]);
    if (path === `/api/catalog/products/${product.id}` && method === 'GET') return json(route, product);
    if (path.startsWith('/api/catalog/skus/') && method === 'GET') return json(route, product.variants[0]);
    if (path === '/api/cart' && method === 'GET') return json(route, cart);
    if (path === '/api/cart/items' && method === 'PUT') {
      const body = request.postDataJSON() as { skuId: string; quantity: number };
      cart = { ...cart, items: [{ ...body, addedAt: '2026-06-20T10:00:00Z' }] };
      return json(route, cart);
    }
    if (path.startsWith('/api/cart/items/') && method === 'DELETE') {
      cart = { ...cart, items: [] };
      return json(route, cart);
    }
    if (path === '/api/cart' && method === 'DELETE') {
      cart = { ...cart, items: [] };
      return json(route, cart);
    }
    if (path === '/api/orders/checkout' && method === 'POST') {
      if (!request.headers()['idempotency-key']) return json(route, { message: 'Missing idempotency key' }, 400);
      return json(route, { orderId: '50000000-0000-0000-0000-000000000001', status: 'PROCESSING' }, 202);
    }
    if (path === '/api/orders/50000000-0000-0000-0000-000000000001' && method === 'GET') {
      orderReads += 1;
      return json(route, { orderId: '50000000-0000-0000-0000-000000000001', status: orderReads > 1 ? 'COMPLETED' : 'PROCESSING', sagaState: orderReads > 1 ? 'COMPLETED' : 'PAYMENT_AUTHORIZED', totalMinor: 7999, currency: 'PLN', lines: [{ skuId: product.variants[0].id, quantity: 1, unitPriceMinor: 7999, currency: 'PLN' }], failureCode: null, createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-06-20T10:01:00Z' });
    }
    if (path === '/api/shipping/orders/50000000-0000-0000-0000-000000000001') return json(route, { id: '60000000-0000-0000-0000-000000000001', orderId: '50000000-0000-0000-0000-000000000001', userId: '40000000-0000-0000-0000-000000000001', status: 'CREATED', trackingNumber: 'ATL-2026-00001', recipient: 'Buyer Test', addressLine1: 'Main Street 1', city: 'Warsaw', postalCode: '00-001', country: 'PL', createdAt: '2026-06-20T10:01:00Z', updatedAt: '2026-06-20T10:01:00Z' });
    if (path === '/api/admin/inventory' && method === 'GET') return json(route, [{ skuId: product.variants[0].id, availableQuantity: 25, reservedQuantity: 2, soldQuantity: 10, version: 4, bucketCount: 16, updatedAt: '2026-06-20T10:00:00Z' }]);
    if (path === '/api/admin/inventory/hot-skus' && method === 'GET') return json(route, [{ skuId: product.variants[0].id, attempts: 1300, contentions: 7, insufficient: 2, averageMicros: 812 }]);
    if (path === '/api/admin/inventory' && method === 'PUT') return route.fulfill({ status: 204, body: '' });
    if (path.startsWith('/api/admin/payments/orders/')) return json(route, { id: '70000000-0000-0000-0000-000000000001', orderId: path.split('/').at(-1), status: 'CAPTURED', amountMinor: 7999, currency: 'PLN', paymentToken: null, providerPaymentId: '71000000-0000-0000-0000-000000000001', providerReference: 'PAY-001', authorizationKey: 'auth-key', version: 2, createdAt: '2026-06-20T10:00:00Z', updatedAt: '2026-06-20T10:01:00Z' });
    if (path.startsWith('/api/admin/audit/')) return json(route, [{ id: '80000000-0000-0000-0000-000000000001', eventId: '81000000-0000-0000-0000-000000000001', source: 'order-service', action: 'ORDER_COMPLETED', aggregateType: 'ORDER', aggregateId: path.split('/').at(-1), outcome: 'SUCCESS', details: 'Saga completed', occurredAt: '2026-06-20T10:01:00Z', receivedAt: '2026-06-20T10:01:01Z' }]);
    if (path === '/api/admin/catalog/products' && method === 'POST') return json(route, product, 201);
    return json(route, { code: 'NOT_FOUND', message: `No mock for ${method} ${path}` }, 404);
  });
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
}
