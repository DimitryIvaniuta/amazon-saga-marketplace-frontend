import { ApiClientError } from './client';
import { queryRetryDelay, shouldRetryQuery } from './retry';

describe('query retry policy', () => {
  it('retries bounded transient failures', () => {
    expect(shouldRetryQuery(0, new ApiClientError('Down', 503, 'DOWN', null, []))).toBe(true);
    expect(shouldRetryQuery(1, new ApiClientError('Rate limited', 429, 'LIMIT', null, []))).toBe(true);
    expect(shouldRetryQuery(2, new ApiClientError('Down', 503, 'DOWN', null, []))).toBe(false);
  });

  it('does not retry client and authorization failures', () => {
    expect(shouldRetryQuery(0, new ApiClientError('Invalid', 400, 'INVALID', null, []))).toBe(false);
    expect(shouldRetryQuery(0, new ApiClientError('Forbidden', 403, 'FORBIDDEN', null, []))).toBe(false);
    expect(shouldRetryQuery(0, new ApiClientError('Cancelled', 499, 'CLIENT_CANCELLED', null, []))).toBe(false);
  });

  it('honors a bounded Retry-After delay', () => {
    const error = new ApiClientError('Rate limited', 429, 'LIMIT', null, [], 10_000);
    expect(queryRetryDelay(0, error)).toBe(4_000);
  });

  it('retries an unknown error only once', () => {
    expect(shouldRetryQuery(0, new Error('unknown'))).toBe(true);
    expect(shouldRetryQuery(1, new Error('unknown'))).toBe(false);
  });

  it('adds bounded jitter to exponential backoff', () => {
    const randomSpy = vi.spyOn(crypto, 'getRandomValues').mockImplementation(<T extends ArrayBufferView | null>(array: T): T => {
      if (array instanceof Uint32Array) array[0] = 0xffffffff;
      return array;
    });
    expect(queryRetryDelay(0, new Error('transient'))).toBe(420);
    expect(queryRetryDelay(10, new Error('transient'))).toBe(4_800);
    randomSpy.mockRestore();
  });

});
