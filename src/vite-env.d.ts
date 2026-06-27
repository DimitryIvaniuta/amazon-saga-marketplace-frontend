/// <reference types="vite/client" />

type RuntimeConfig = {
  apiBaseUrl?: string;
  appName?: string;
  orderPollingMs?: number;
  release?: string;
  telemetryEndpoint?: string;
  telemetrySampleRate?: number;
};

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeConfig;
  }
}

export {};
