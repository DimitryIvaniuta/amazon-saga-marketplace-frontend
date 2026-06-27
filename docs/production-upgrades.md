# Production upgrade assessment

## Correctness

- Added runtime API contracts to prevent malformed backend data from silently corrupting UI state.
- Bound checkout key reuse to an equivalent request fingerprint.
- Serialized cart writes and disabled implicit mutation retries.
- Added scheduled session expiration and validated stored state.

## Reliability

- Added request cancellation and bounded timeouts.
- Added transient-read retry classification, jitter, and `Retry-After` support.
- Added render recovery, offline feedback, and safe user retry paths.
- Added release-aware client telemetry that cannot affect checkout.

## Security

- Restricted mutable browser endpoints to same-origin paths.
- Added redirect validation and spreadsheet-injection protection.
- Expanded response validation and browser security headers.
- Added dependency audit, SBOM generation, and immutable-container validation.

## Performance

- Retained route-level code splitting.
- Dynamically loads Web Vitals only when enabled.
- Added enforceable asset budgets.
- Deep-linked catalog state avoids unnecessary client state duplication.

## Accessibility and UX

- Added skip navigation, focus restoration, route announcements, offline status, toast feedback, error descriptions, mobile drawer keyboard handling, and axe-based browser checks.
- Added product filtering/sorting and inventory export while preserving backend contracts.
