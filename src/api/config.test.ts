describe('runtime application configuration', () => {
  afterEach(() => {
    delete window.__APP_CONFIG__;
    vi.resetModules();
  });

  it('accepts same-origin paths and clamps operational values', async () => {
    window.__APP_CONFIG__ = {
      apiBaseUrl: '/gateway/',
      orderPollingMs: 200,
      telemetryEndpoint: '/rum',
      telemetrySampleRate: 4,
    };

    const { appConfig } = await import('./config');
    expect(appConfig.apiBaseUrl).toBe('/gateway');
    expect(appConfig.orderPollingMs).toBe(1_000);
    expect(appConfig.telemetryEndpoint).toBe('/rum');
    expect(appConfig.telemetrySampleRate).toBe(1);
  });

  it('rejects cross-origin API and telemetry destinations', async () => {
    window.__APP_CONFIG__ = {
      apiBaseUrl: 'https://untrusted.example',
      telemetryEndpoint: '//untrusted.example/collect',
    };

    const { appConfig } = await import('./config');
    expect(appConfig.apiBaseUrl).toBe('');
    expect(appConfig.telemetryEndpoint).toBe('');
  });
});
