# Frontend architecture

## Boundaries

The browser talks only to the API Gateway through a same-origin `/api` path. NGINX owns gateway proxying in production; Vite provides the equivalent development proxy. Browser runtime configuration cannot redirect bearer tokens or telemetry to another origin.

## Application layers

1. `src/api`: HTTP boundary, Zod contracts, request cancellation, correlation IDs, and retry classification.
2. `src/auth`: validated tab-scoped session state, role checks, and scheduled expiry.
3. `src/features`: vertical customer and administration workflows.
4. `src/components`: layout, recovery, connectivity, accessibility, and reusable presentation.
5. `src/observability`: optional Core Web Vitals and client-error events without user or transaction identifiers.
6. `src/utils`: deterministic helpers such as checkout fingerprints and CSV escaping.

## Data flow

TanStack Query owns remote read state. Query functions forward its `AbortSignal` to `apiRequest`, so superseded navigation and unmounted views stop in-flight work. Successful responses are parsed by Zod before entering the UI. Contract mismatches fail closed with `API_CONTRACT_ERROR` and a correlation reference.

Mutations do not retry automatically. Cart writes are serialized to prevent out-of-order updates. Checkout derives an idempotency key from a SHA-256 fingerprint of the semantic request; an equivalent user retry reuses the key, while changed payment or shipping data receives a new key.

## Routing and rendering

Routes are lazy-loaded to keep customer and administration features out of the initial bundle. Protected routes preserve safe internal deep links. Route transitions scroll to the top, focus the main landmark, and announce the new page to assistive technology.

## Failure model

- Expected service errors are normalized by the API client.
- Transient reads use bounded retry with jitter.
- Mutations remain user-controlled.
- A global React error boundary prevents a rendering fault from leaving an ambiguous purchase UI.
- Offline state is shown independently of backend state.
- RUM failures are swallowed and never affect checkout.
