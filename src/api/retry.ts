import { ApiClientError } from './client';

const MAX_QUERY_RETRIES = 2;
const BASE_DELAY_MS = 350;
const MAX_DELAY_MS = 4_000;

/**
 * Retries only transient read failures. Authentication, validation, conflict,
 * and not-found responses require user action and are intentionally not retried.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  if (!(error instanceof ApiClientError)) return failureCount < 1;
  return error.status === 0 || error.status === 408 || error.status === 425 || error.status === 429 || error.status >= 500;
}

/** Adds bounded exponential backoff and jitter to avoid synchronized retries. */
export function queryRetryDelay(attemptIndex: number, error: unknown): number {
  if (error instanceof ApiClientError && error.retryAfterMs !== null) {
    return Math.min(error.retryAfterMs, MAX_DELAY_MS);
  }
  const exponential = Math.min(BASE_DELAY_MS * 2 ** attemptIndex, MAX_DELAY_MS);
  const jitter = Math.floor(exponential * 0.2 * secureRandomFraction());
  return exponential + jitter;
}

function secureRandomFraction(): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return (value[0] ?? 0) / 0xffffffff;
}
