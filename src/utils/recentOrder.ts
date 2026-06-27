import { uuidSchema } from '../api/schemas';

const LAST_ORDER_KEY = 'atlas-marketplace.last-order-id';

export const recentOrderStorage = {
  read(): string | null {
    const value = sessionStorage.getItem(LAST_ORDER_KEY);
    if (!value || !uuidSchema.safeParse(value).success) {
      sessionStorage.removeItem(LAST_ORDER_KEY);
      return null;
    }
    return value;
  },
  write(orderId: string): void {
    sessionStorage.setItem(LAST_ORDER_KEY, uuidSchema.parse(orderId));
  },
  clear(): void {
    sessionStorage.removeItem(LAST_ORDER_KEY);
  },
};

export function isUuid(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}
