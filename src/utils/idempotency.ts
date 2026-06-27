import type { CheckoutRequest } from '../api/types';

const KEY = 'atlas-marketplace.checkout-attempt';

interface StoredAttempt {
  fingerprint: string;
  key: string;
}

/**
 * Reuses one key only for an equivalent checkout payload. The persisted value
 * contains a SHA-256 fingerprint instead of the payment token or address, so
 * a changed retry gets a fresh semantic key without storing sensitive input.
 */
export async function checkoutIdempotencyKey(request: CheckoutRequest): Promise<string> {
  const fingerprint = await requestFingerprint(request);
  const existing = readAttempt();
  if (existing?.fingerprint === fingerprint) return existing.key;

  const created = { fingerprint, key: crypto.randomUUID() } satisfies StoredAttempt;
  sessionStorage.setItem(KEY, JSON.stringify(created));
  return created.key;
}

export function completeCheckoutAttempt(): void {
  sessionStorage.removeItem(KEY);
}

async function requestFingerprint(request: CheckoutRequest): Promise<string> {
  // Explicit property order makes the digest stable across equivalent objects.
  const canonical = JSON.stringify({
    paymentToken: request.paymentToken,
    shippingAddress: {
      recipient: request.shippingAddress.recipient,
      addressLine1: request.shippingAddress.addressLine1,
      city: request.shippingAddress.city,
      postalCode: request.shippingAddress.postalCode,
      country: request.shippingAddress.country,
    },
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readAttempt(): StoredAttempt | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAttempt>;
    return typeof parsed.key === 'string' && typeof parsed.fingerprint === 'string'
      ? { key: parsed.key, fingerprint: parsed.fingerprint }
      : null;
  } catch {
    sessionStorage.removeItem(KEY);
    return null;
  }
}
