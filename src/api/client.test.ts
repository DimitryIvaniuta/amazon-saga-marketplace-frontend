import { apiRequest, ApiClientError } from './client';
import { z } from 'zod';
import { authStorage } from '../auth/authStorage';

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('apiRequest', () => {
  it('adds bearer and correlation headers', async () => {
    authStorage.write({ accessToken: 'abc', tokenType: 'Bearer', expiresAt: '2099-01-01T00:00:00Z', roles: [], email: 'a@b.com' });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({ ok: true }));
    await apiRequest('/api/test');
    const init = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer abc');
    expect(headers.get('X-Correlation-Id')).toBeTruthy();
  });

  it('normalizes backend errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({ code: 'VALIDATION_FAILED', message: 'Invalid', correlationId: 'corr-1', violations: ['email: invalid'] }, 400));
    await expect(apiRequest('/api/test')).rejects.toMatchObject({ status: 400, code: 'VALIDATION_FAILED', correlationId: 'corr-1', violations: ['email: invalid'] });
  });


  it('rejects successful responses that violate the runtime contract', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({ id: 42 }));
    await expect(apiRequest('/api/test', { schema: z.object({ id: z.string() }) })).rejects.toMatchObject({
      status: 502,
      code: 'API_CONTRACT_ERROR',
    });
  });

  it('captures Retry-After metadata from backend errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Slow down' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': '2' },
    }));
    await expect(apiRequest('/api/test')).rejects.toMatchObject({ retryAfterMs: 2_000 });
  });

  it('clears the session on unauthorized responses', async () => {
    authStorage.write({ accessToken: 'abc', tokenType: 'Bearer', expiresAt: '2099-01-01T00:00:00Z', roles: [], email: 'a@b.com' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({ message: 'Unauthorized' }, 401));
    await expect(apiRequest('/api/test')).rejects.toBeInstanceOf(ApiClientError);
    expect(authStorage.read()).toBeNull();
  });

  it('returns undefined for successful no-content responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiRequest('/api/test')).resolves.toBeUndefined();
  });

  it('rejects non-JSON success responses as contract failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>unexpected</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'X-Correlation-Id': 'corr-html' },
    }));
    await expect(apiRequest('/api/test')).rejects.toMatchObject({
      status: 502,
      code: 'API_CONTRACT_ERROR',
      correlationId: 'corr-html',
    });
  });

  it('normalizes network failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network down'));
    await expect(apiRequest('/api/test')).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
    });
  });

  it('distinguishes caller cancellation from request timeout', async () => {
    const callerController = new AbortController();
    callerController.abort();
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    await expect(apiRequest('/api/test', { signal: callerController.signal })).rejects.toMatchObject({
      status: 499,
      code: 'CLIENT_CANCELLED',
    });

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    await expect(apiRequest('/api/test')).rejects.toMatchObject({
      status: 408,
      code: 'CLIENT_TIMEOUT',
    });
  });

  it('handles non-JSON backend errors and HTTP-date Retry-After values', async () => {
    const retryAt = new Date(Date.now() + 2_000).toUTCString();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('gateway unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain', 'Retry-After': retryAt },
    }));
    const error = await apiRequest('/api/test').catch((caught: unknown) => caught);
    expect(error).toMatchObject({ status: 503, code: 'HTTP_ERROR' });
    expect((error as ApiClientError).retryAfterMs).toBeGreaterThanOrEqual(0);
    expect((error as ApiClientError).retryAfterMs).toBeLessThanOrEqual(2_000);
  });

});
