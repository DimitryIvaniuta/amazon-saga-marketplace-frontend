# Security model

## Session handling

The backend currently returns bearer tokens rather than a secure browser session cookie. Tokens are therefore stored only in `sessionStorage`, validated with Zod before use, removed when expired, and cleared on 401 responses. They are not persisted across browser restarts. Production deployments should prefer backend-managed `HttpOnly`, `Secure`, `SameSite` cookies when the gateway supports them.

## Request safety

- API and telemetry runtime paths must be empty or root-relative.
- Every request receives a correlation ID.
- Successful JSON is runtime-validated.
- Request timeouts are bounded.
- Query cancellation propagates to `fetch`.
- Mutation retries are globally disabled.
- Checkout idempotency keys are bound to a non-sensitive SHA-256 request fingerprint.
- External payment tokens are never stored by the frontend.
- CSV export neutralizes spreadsheet formula prefixes.
- Redirect targets are restricted to internal paths.

## Browser edge controls

The production NGINX template sets CSP, frame denial, MIME sniffing protection, strict referrer policy, permissions policy, cross-origin opener/resource policies, and legacy cross-domain policy denial. Runtime configuration is served with `no-store`; fingerprinted assets are immutable.

## Container controls

The runtime image is unprivileged. The supplied Compose profile uses a read-only filesystem, temporary writable mounts, `no-new-privileges`, and no Linux capabilities.

## Supply chain

- Exact package versions and npm lockfile.
- Dependabot for npm, GitHub Actions, and Docker.
- High-severity npm audit gate.
- CycloneDX production SBOM generation.
- Pinned Node and NGINX base-image versions.
- CI bundle, build, test, and container-health gates.

## Residual risks

A bearer token remains readable by JavaScript, so preventing XSS is critical. CSP and the lack of arbitrary HTML rendering reduce exposure, but a backend-issued secure cookie would provide stronger token isolation. Automated accessibility checks complement rather than replace manual keyboard and screen-reader testing.
