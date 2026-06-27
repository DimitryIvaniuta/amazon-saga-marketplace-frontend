# Operations guide

## Deployment sequence

1. Run `npm ci` under the pinned Node version.
2. Run `npm run security:audit` and `npm run check`.
3. Generate and archive `npm run security:sbom` output.
4. Build the immutable container image.
5. Configure `API_UPSTREAM` server-side.
6. Optionally configure release-tagged RUM.
7. Start with a read-only root filesystem and dropped capabilities.
8. Verify `/healthz`, `/config.js`, catalog loading, login, and a non-production checkout flow.

## Rollback

The frontend is stateless. Roll back by restoring the previous image digest. Do not reuse a failed checkout with edited request data; the application creates a new idempotency key when the semantic request changes.

## Incident checks

- **Blank/recovery screen:** inspect client-error telemetry by release and route; use the displayed recovery action.
- **Slow pages:** compare Web Vitals by route and release, then inspect gateway/backend latency.
- **Repeated 401:** check JWT expiry, issuer/audience, browser clock, and gateway configuration.
- **Contract errors:** compare frontend Zod schemas with the deployed backend response and use the correlation ID.
- **Offline banner:** confirm browser connectivity before retrying a read; inspect order state before repeating checkout.
- **RUM missing:** confirm root-relative endpoint, sampling rate, CSP, and ingestion response.

## Runtime configuration rules

`API_BASE_URL` and `TELEMETRY_ENDPOINT` reject absolute or protocol-relative URLs. `ORDER_POLLING_MS` must be 1000–60000. `TELEMETRY_SAMPLE_RATE` must be numeric and between 0 and 1. Invalid values stop the container rather than starting with unsafe configuration.
