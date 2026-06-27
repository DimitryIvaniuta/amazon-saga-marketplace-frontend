import type { ZodType } from 'zod';
import { authStorage } from '../auth/authStorage';
import { appConfig } from './config';
import type { ApiErrorBody } from './types';

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly correlationId: string | null,
    readonly violations: string[],
    readonly retryAfterMs: number | null = null,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

type RequestOptions<T> = Omit<RequestInit, 'body' | 'signal'> & {
  body?: unknown;
  authenticated?: boolean;
  timeoutMs?: number;
  schema?: ZodType<T>;
  signal?: AbortSignal | undefined;
};

/**
 * Central HTTP boundary. It adds correlation IDs and bearer tokens, consumes
 * AbortSignals from TanStack Query, bounds request time, validates successful
 * JSON at runtime, and never retries state-changing calls implicitly.
 */
export async function apiRequest<T>(path: string, options: RequestOptions<T> = {}): Promise<T> {
  const {
    body,
    authenticated = true,
    timeoutMs = 12_000,
    signal,
    schema,
    ...requestInit
  } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort('timeout'), timeoutMs);
  const headers = new Headers(requestInit.headers);
  const correlationId = crypto.randomUUID();
  headers.set('Accept', 'application/json');
  headers.set('X-Correlation-Id', correlationId);

  if (body !== undefined) headers.set('Content-Type', 'application/json');
  if (authenticated) {
    const token = authStorage.read()?.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...requestInit,
    headers,
    signal: combineSignals(signal ? [controller.signal, signal] : [controller.signal]),
  };
  if (body !== undefined) fetchOptions.body = JSON.stringify(body);

  try {
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, fetchOptions);

    if (!response.ok) {
      const error = await parseError(response);
      if (authenticated && response.status === 401) {
        authStorage.clear();
        window.dispatchEvent(new Event('atlas:session-expired'));
      }
      throw error;
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new ApiClientError(
        'The service returned an unsupported response format.',
        502,
        'API_CONTRACT_ERROR',
        response.headers.get('X-Correlation-Id') ?? correlationId,
        [],
      );
    }

    const payload: unknown = await response.json();
    if (!schema) return payload as T;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiClientError(
        'The service response did not match the expected contract.',
        502,
        'API_CONTRACT_ERROR',
        response.headers.get('X-Correlation-Id') ?? correlationId,
        parsed.error.issues.slice(0, 5).map((issue) => `${issue.path.join('.') || 'response'}: ${issue.message}`),
      );
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      const isCallerCancellation = signal?.aborted === true;
      throw new ApiClientError(
        isCallerCancellation ? 'The request was cancelled.' : 'The request took too long. Please retry.',
        isCallerCancellation ? 499 : 408,
        isCallerCancellation ? 'CLIENT_CANCELLED' : 'CLIENT_TIMEOUT',
        correlationId,
        [],
      );
    }
    throw new ApiClientError('The service is currently unavailable.', 0, 'NETWORK_ERROR', correlationId, []);
  } finally {
    window.clearTimeout(timeout);
  }
}

async function parseError(response: Response): Promise<ApiClientError> {
  let body: ApiErrorBody = {};
  try {
    body = await response.json() as ApiErrorBody;
  } catch {
    // Infrastructure failures can return an empty or non-JSON response.
  }
  return new ApiClientError(
    body.message || `Request failed with status ${response.status}`,
    response.status,
    body.code || 'HTTP_ERROR',
    body.correlationId ?? response.headers.get('X-Correlation-Id'),
    body.violations ?? [],
    parseRetryAfter(response.headers.get('Retry-After')),
  );
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

function combineSignals(signals: AbortSignal[]): AbortSignal {
  if (signals.length === 1) return signals[0] as AbortSignal;
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals);
  const controller = new AbortController();
  const abort = () => controller.abort();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener('abort', abort, { once: true });
  }
  return controller.signal;
}
