# Changelog

## 1.1.0 — 2026-06-21

### Added

- Runtime Zod validation for backend responses.
- HTTP-aware read retry policy and request cancellation.
- Scheduled session expiration and global render recovery.
- Offline banner, route announcements, toast notifications, and safer form descriptions.
- URL-driven catalog filters and sorting.
- Inventory CSV export with spreadsheet-injection protection.
- Optional privacy-conscious Web Vitals and client-error telemetry.
- Bundle budgets, npm audit gate, CycloneDX SBOM, and immutable-container health verification.
- Accessibility and access-control Playwright suites.

### Changed

- Runtime API/telemetry paths are same-origin only.
- Cart mutations are serialized.
- Checkout keys are reused only for equivalent semantic requests.
- All query functions propagate AbortSignal.
- NGINX and runtime configuration validation are stricter.

### Security

- Added Cross-Origin-Resource-Policy and X-Permitted-Cross-Domain-Policies.
- Added safe redirect and CSV export protections.
- Preserved non-persistent bearer-token handling and disabled automatic mutation retries.
