# Testing strategy

## Static gates

- ESLint with zero warnings.
- Strict TypeScript project compilation.
- Structural verification of required features, gateway routes, central HTTP usage, non-persistent sessions, response schemas, and mutation retry policy.
- Shell syntax and runtime-configuration validation.

## Unit and component tests

Vitest and Testing Library cover API normalization, runtime contracts, cancellation semantics, retry policy, session validation, idempotency fingerprints, safe redirects, CSV injection protection, connectivity events, error recovery, notifications, route guards, buttons, formatting, and product presentation.

Coverage thresholds are enforced for core HTTP, security, idempotency, utility, and system components.

## Browser tests

Playwright runs desktop Chrome and Pixel 7 profiles for:

- public catalog browsing;
- customer checkout and Saga completion;
- administrator inventory/hot-SKU operations;
- mobile navigation;
- anonymous deep-link restoration;
- customer/admin access separation;
- automated WCAG A/AA checks on public and authenticated pages.

API mocks preserve real route names, response shapes, idempotency headers, asynchronous order progression, and role behavior.

## Performance and supply-chain gates

The production build is checked against explicit raw bundle budgets:

- largest JavaScript asset: 300 KiB;
- total JavaScript: 700 KiB;
- total CSS: 120 KiB.

CI also runs `npm audit`, generates a production CycloneDX SBOM, and starts the final image under its immutable runtime profile before checking `/healthz`.
