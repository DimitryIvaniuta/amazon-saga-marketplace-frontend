import { apiRequest } from './client';
import {
  auditEntriesSchema,
  cartSchema,
  checkoutAcceptedSchema,
  hotSkusSchema,
  inventorySchema,
  orderViewSchema,
  paymentProjectionSchema,
  productSchema,
  productsSchema,
  productVariantSchema,
  registeredUserSchema,
  shipmentSchema,
  tokenResponseSchema,
} from './schemas';
import type {
  AuditEntry,
  Cart,
  CheckoutAccepted,
  CheckoutRequest,
  CreateProductRequest,
  HotSku,
  InventoryStock,
  OrderView,
  PaymentProjection,
  Product,
  ProductVariant,
  RegisteredUser,
  Shipment,
  TokenResponse,
  UUID,
} from './types';

interface RequestContext {
  signal?: AbortSignal;
}

export const authApi = {
  register: (body: { email: string; password: string }) =>
    apiRequest<RegisteredUser>('/api/auth/register', {
      method: 'POST',
      body,
      authenticated: false,
      schema: registeredUserSchema,
    }),
  login: (body: { email: string; password: string }) =>
    apiRequest<TokenResponse>('/api/auth/login', {
      method: 'POST',
      body,
      authenticated: false,
      schema: tokenResponseSchema,
    }),
};

export const catalogApi = {
  products: ({ signal }: RequestContext = {}) => apiRequest<Product[]>('/api/catalog/products', {
    authenticated: false,
    signal,
    schema: productsSchema,
  }),
  product: (id: UUID, { signal }: RequestContext = {}) => apiRequest<Product>(`/api/catalog/products/${id}`, {
    authenticated: false,
    signal,
    schema: productSchema,
  }),
  variant: (id: UUID, { signal }: RequestContext = {}) => apiRequest<ProductVariant>(`/api/catalog/skus/${id}`, {
    authenticated: false,
    signal,
    schema: productVariantSchema,
  }),
  create: (body: CreateProductRequest) => apiRequest<Product>('/api/admin/catalog/products', {
    method: 'POST',
    body,
    schema: productSchema,
  }),
};

export const cartApi = {
  get: ({ signal }: RequestContext = {}) => apiRequest<Cart>('/api/cart', { signal, schema: cartSchema }),
  setItem: (skuId: UUID, quantity: number) => apiRequest<Cart>('/api/cart/items', {
    method: 'PUT',
    body: { skuId, quantity },
    schema: cartSchema,
  }),
  removeItem: (skuId: UUID) => apiRequest<Cart>(`/api/cart/items/${skuId}`, {
    method: 'DELETE',
    schema: cartSchema,
  }),
  clear: () => apiRequest<Cart>('/api/cart', { method: 'DELETE', schema: cartSchema }),
};

export const orderApi = {
  checkout: (body: CheckoutRequest, idempotencyKey: string) =>
    apiRequest<CheckoutAccepted>('/api/orders/checkout', {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': idempotencyKey },
      timeoutMs: 15_000,
      schema: checkoutAcceptedSchema,
    }),
  byId: (orderId: UUID, { signal }: RequestContext = {}) => apiRequest<OrderView>(`/api/orders/${orderId}`, {
    signal,
    schema: orderViewSchema,
  }),
};

export const shippingApi = {
  byOrder: (orderId: UUID, { signal }: RequestContext = {}) => apiRequest<Shipment>(`/api/shipping/orders/${orderId}`, {
    signal,
    schema: shipmentSchema,
  }),
};

export const adminApi = {
  inventory: ({ signal }: RequestContext = {}) => apiRequest<InventoryStock[]>('/api/admin/inventory', {
    signal,
    schema: inventorySchema,
  }),
  hotSkus: (limit = 20, { signal }: RequestContext = {}) => apiRequest<HotSku[]>(`/api/admin/inventory/hot-skus?limit=${limit}`, {
    signal,
    schema: hotSkusSchema,
  }),
  setStock: (skuId: UUID, availableQuantity: number) => apiRequest<void>('/api/admin/inventory', {
    method: 'PUT',
    body: { skuId, availableQuantity },
  }),
  paymentByOrder: (orderId: UUID, { signal }: RequestContext = {}) => apiRequest<PaymentProjection>(`/api/admin/payments/orders/${orderId}`, {
    signal,
    schema: paymentProjectionSchema,
  }),
  auditByAggregate: (aggregateId: string, { signal }: RequestContext = {}) => apiRequest<AuditEntry[]>(`/api/admin/audit/${encodeURIComponent(aggregateId)}`, {
    signal,
    schema: auditEntriesSchema,
  }),
};

export const queryKeys = {
  products: ['products'] as const,
  product: (id: UUID) => ['products', id] as const,
  variant: (id: UUID) => ['variants', id] as const,
  cart: ['cart'] as const,
  order: (id: UUID) => ['orders', id] as const,
  shipment: (id: UUID) => ['shipping', id] as const,
  inventory: ['admin', 'inventory'] as const,
  hotSkus: ['admin', 'hot-skus'] as const,
  payment: (id: UUID) => ['admin', 'payment', id] as const,
  audit: (id: string) => ['admin', 'audit', id] as const,
};
