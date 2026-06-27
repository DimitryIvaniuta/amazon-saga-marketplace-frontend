export type UUID = string;

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  code?: string;
  message?: string;
  path?: string;
  correlationId?: string | null;
  violations?: string[];
}

export interface RegisteredUser {
  userId: UUID;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  roles: string[];
}

export interface ProductVariant {
  id: UUID;
  skuCode: string;
  attributes: Record<string, string>;
  priceMinor: number;
  currency: string;
  active: boolean;
}

export interface Product {
  id: UUID;
  name: string;
  description: string;
  category: string;
  active: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface CreateVariantRequest {
  skuCode: string;
  attributes: Record<string, string>;
  priceMinor: number;
  currency: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  variants: CreateVariantRequest[];
}

export interface CartItem {
  skuId: UUID;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  cartId: UUID;
  userId: UUID;
  items: CartItem[];
  updatedAt: string;
}

export interface ShippingAddress {
  recipient: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutRequest {
  paymentToken: string;
  shippingAddress: ShippingAddress;
}

export interface CheckoutAccepted {
  orderId: UUID;
  status: string;
}

export interface OrderLine {
  skuId: UUID;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
}

export interface OrderView {
  orderId: UUID;
  status: string;
  sagaState: string;
  totalMinor: number;
  currency: string;
  lines: OrderLine[];
  failureCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: UUID;
  orderId: UUID;
  userId: UUID;
  status: string;
  trackingNumber: string;
  recipient: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStock {
  skuId: UUID;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  version: number;
  bucketCount: number;
  updatedAt: string;
}

export interface HotSku {
  skuId: UUID;
  attempts: number;
  contentions: number;
  insufficient: number;
  averageMicros: number;
}

export interface PaymentProjection {
  id: UUID;
  orderId: UUID;
  status: string;
  amountMinor: number;
  currency: string;
  paymentToken: string | null;
  providerPaymentId: UUID | null;
  providerReference: string | null;
  authorizationKey: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: UUID;
  eventId: UUID;
  source: string;
  action: string;
  aggregateType: string;
  aggregateId: string;
  outcome: string;
  details: string;
  occurredAt: string;
  receivedAt: string;
}
