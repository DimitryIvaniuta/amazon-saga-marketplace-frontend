import { z } from 'zod';

export const uuidSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID');
const uuid = uuidSchema;
const timestamp = z.string().datetime({ offset: true });
const moneyMinor = z.number().int().nonnegative();

export const registeredUserSchema = z.object({
  userId: uuid,
  email: z.string().email(),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().min(1),
  expiresAt: timestamp,
  roles: z.array(z.string().min(1)),
});

export const productVariantSchema = z.object({
  id: uuid,
  skuCode: z.string().min(1),
  attributes: z.record(z.string(), z.string()),
  priceMinor: moneyMinor,
  currency: z.string().length(3),
  active: z.boolean(),
});

export const productSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  description: z.string(),
  category: z.string().min(1),
  active: z.boolean(),
  variants: z.array(productVariantSchema),
  createdAt: timestamp,
});

export const cartSchema = z.object({
  cartId: uuid,
  userId: uuid,
  items: z.array(z.object({
    skuId: uuid,
    quantity: z.number().int().positive(),
    addedAt: timestamp,
  })),
  updatedAt: timestamp,
});

export const checkoutAcceptedSchema = z.object({
  orderId: uuid,
  status: z.string().min(1),
});

export const orderViewSchema = z.object({
  orderId: uuid,
  status: z.string().min(1),
  sagaState: z.string().min(1),
  totalMinor: moneyMinor,
  currency: z.string().length(3),
  lines: z.array(z.object({
    skuId: uuid,
    quantity: z.number().int().positive(),
    unitPriceMinor: moneyMinor,
    currency: z.string().length(3),
  })),
  failureCode: z.string().nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const shipmentSchema = z.object({
  id: uuid,
  orderId: uuid,
  userId: uuid,
  status: z.string().min(1),
  trackingNumber: z.string().min(1),
  recipient: z.string().min(1),
  addressLine1: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const inventoryStockSchema = z.object({
  skuId: uuid,
  availableQuantity: z.number().int().nonnegative(),
  reservedQuantity: z.number().int().nonnegative(),
  soldQuantity: z.number().int().nonnegative(),
  version: z.number().int().nonnegative(),
  bucketCount: z.number().int().positive(),
  updatedAt: timestamp,
});

export const hotSkuSchema = z.object({
  skuId: uuid,
  attempts: z.number().int().nonnegative(),
  contentions: z.number().int().nonnegative(),
  insufficient: z.number().int().nonnegative(),
  averageMicros: z.number().nonnegative(),
});

export const paymentProjectionSchema = z.object({
  id: uuid,
  orderId: uuid,
  status: z.string().min(1),
  amountMinor: moneyMinor,
  currency: z.string().length(3),
  paymentToken: z.string().nullable(),
  providerPaymentId: uuid.nullable(),
  providerReference: z.string().nullable(),
  authorizationKey: z.string().min(1),
  version: z.number().int().nonnegative(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const auditEntrySchema = z.object({
  id: uuid,
  eventId: uuid,
  source: z.string().min(1),
  action: z.string().min(1),
  aggregateType: z.string().min(1),
  aggregateId: z.string().min(1),
  outcome: z.string().min(1),
  details: z.string(),
  occurredAt: timestamp,
  receivedAt: timestamp,
});

export const productsSchema = z.array(productSchema);
export const inventorySchema = z.array(inventoryStockSchema);
export const hotSkusSchema = z.array(hotSkuSchema);
export const auditEntriesSchema = z.array(auditEntrySchema);
