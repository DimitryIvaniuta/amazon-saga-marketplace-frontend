const runtime = window.__APP_CONFIG__ ?? {};

export const appConfig = {
  apiBaseUrl: normalizeSameOriginPath(runtime.apiBaseUrl),
  appName: runtime.appName?.trim() || 'Atlas Marketplace',
  orderPollingMs: clamp(runtime.orderPollingMs ?? 2_000, 1_000, 60_000),
  release: runtime.release?.trim() || 'development',
  telemetryEndpoint: normalizeSameOriginPath(runtime.telemetryEndpoint),
  telemetrySampleRate: clamp(runtime.telemetrySampleRate ?? 0, 0, 1),
} as const;

/**
 * Bearer tokens and telemetry must never be redirected to another origin by a
 * mutable runtime configuration file. Empty and root-relative paths are safe.
 */
function normalizeSameOriginPath(value: string | undefined): string {
  const endpoint = value?.trim().replace(/\/$/, '') ?? '';
  return endpoint === '' || (endpoint.startsWith('/') && !endpoint.startsWith('//')) ? endpoint : '';
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
