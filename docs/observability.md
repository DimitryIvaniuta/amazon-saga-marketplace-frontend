# Browser observability

## Core Web Vitals

RUM is opt-in. Set a root-relative `TELEMETRY_ENDPOINT` and a `TELEMETRY_SAMPLE_RATE` between 0 and 1. The application dynamically loads `web-vitals` after startup and reports CLS, INP, LCP, FCP, and TTFB.

Events contain only:

- metric/error name;
- metric value, delta, and rating where applicable;
- browser route path;
- application release;
- timestamp;
- a bounded error name/message for client failures.

No email, user ID, token, cart, order, address, payment token, or SKU is included.

## Delivery behavior

Telemetry uses `navigator.sendBeacon` first and a same-origin `fetch` fallback. Reporting failures are ignored by design and can never block a purchase flow.

## Recommended dashboards

Aggregate by release, route, metric, and rating. Use the 75th percentile for user-experience assessment and correlate regressions with deployment releases. Keep error names bounded and avoid including dynamic identifiers in metric dimensions.
