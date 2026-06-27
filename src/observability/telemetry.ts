import type { Metric } from 'web-vitals';
import { appConfig } from '../api/config';

interface ClientTelemetryEvent {
  type: 'web-vital' | 'client-error';
  name: string;
  value?: number;
  rating?: string;
  delta?: number;
  route: string;
  release: string;
  timestamp: string;
  details?: string;
}

/**
 * Starts privacy-conscious RUM after the application is interactive. No user,
 * token, cart, order, or payment data is included in telemetry payloads.
 */
export function startWebVitalsReporting(): void {
  if (!appConfig.telemetryEndpoint || !isSampled(appConfig.telemetrySampleRate)) return;
  void import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
    const report = (metric: Metric) => sendTelemetry({
      type: 'web-vital',
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      rating: metric.rating,
      route: window.location.pathname,
      release: appConfig.release,
      timestamp: new Date().toISOString(),
    });
    onCLS(report);
    onINP(report);
    onLCP(report);
    onFCP(report);
    onTTFB(report);
  }).catch(() => {
    // Telemetry must never affect the customer purchase path.
  });
}

export function reportClientError(error: unknown, name = 'UNHANDLED_CLIENT_ERROR'): void {
  if (!appConfig.telemetryEndpoint) return;
  const message = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown client error';
  sendTelemetry({
    type: 'client-error',
    name,
    route: window.location.pathname,
    release: appConfig.release,
    timestamp: new Date().toISOString(),
    details: message.slice(0, 500),
  });
}

function sendTelemetry(event: ClientTelemetryEvent): void {
  const endpoint = appConfig.telemetryEndpoint;
  if (!endpoint) return;
  const payload = new Blob([JSON.stringify(event)], { type: 'application/json' });
  if (!navigator.sendBeacon(endpoint, payload)) {
    void fetch(endpoint, {
      method: 'POST',
      body: payload,
      keepalive: true,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => undefined);
  }
}

function isSampled(rate: number): boolean {
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return ((value[0] ?? 0) / 0xffffffff) < rate;
}
