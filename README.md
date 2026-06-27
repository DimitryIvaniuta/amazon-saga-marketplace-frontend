# Amazon Saga Marketplace Frontend

Production-grade React 19.2 and TypeScript portal for the Amazon-style multi-service Saga marketplace backend. It provides customer commerce journeys and administrator operations in a responsive, banking-inspired shell.

## Repository metadata

- **Repository:** `amazon-saga-marketplace-frontend`
- **Version:** `1.1.0`
- **Description:** Production-grade React 19.2 and TypeScript marketplace portal with runtime-validated APIs, secure idempotent checkout, Saga tracking, operations tooling, accessibility checks, and privacy-conscious observability.

Create the remote repository after authenticating GitHub CLI:

```bash
gh repo create amazon-saga-marketplace-frontend \
  --public \
  --description "Production-grade React 19.2 and TypeScript marketplace portal with runtime-validated APIs, secure idempotent checkout, Saga tracking, operations tooling, accessibility checks, and privacy-conscious observability." \
  --source . \
  --remote origin \
  --push
```

## Technology

- React 19.2.7 and React DOM 19.2.7
- TypeScript 6.0.3 with strict compiler settings
- Vite 8.0.16
- React Router 8
- TanStack Query 5
- React Hook Form and Zod 4
- Web Vitals 5 for optional real-user monitoring
- Vitest, Testing Library, Playwright, and axe-core
- Unprivileged NGINX production container

## Production upgrades in 1.1.0

- Zod validation for every successful backend response.
- Correlation-aware API errors and safe contract-drift failures.
- AbortSignal propagation from TanStack Query to the browser request.
- Bounded read retries with exponential jitter and `Retry-After` support.
- No automatic retries for checkout, payment, cart, stock, or other mutations.
- Tab-scoped validated sessions with scheduled local expiry.
- Same-origin-only runtime API and telemetry destinations.
- Global render recovery boundary and client-error reporting.
- Offline status, route focus management, screen-reader announcements, and toast feedback.
- Deep-linkable catalog search, category, and sorting state.
- Serialized cart mutations and request-fingerprint-bound checkout idempotency.
- Injection-safe inventory CSV export.
- Optional privacy-conscious Core Web Vitals telemetry.
- Bundle budgets, dependency audit, CycloneDX SBOM, and immutable-container CI checks.
- Automated WCAG and access-control Playwright journeys.

## User journeys

### Customer

- Register and sign in.
- Browse, filter, sort, and search products.
- Select attribute-based variants such as color and size.
- Add, update, remove, and clear cart items.
- Submit shipping details and an external-provider payment token.
- Reuse an idempotency key only for an equivalent checkout request.
- Follow asynchronous order/Saga state through completion or compensation.
- View shipment and tracking information.

### Administrator

- Create products with dynamic variants and arbitrary attributes.
- Inspect, filter, export, and update inventory.
- Diagnose hot-SKU attempts, contention, shortages, and latency.
- Look up payment state without displaying sensitive payment tokens.
- Inspect append-only audit history by aggregate ID.

## Local development

Requirements: Node.js 24.17.0 LTS and npm 10.9 or newer.

```bash
cp .env.example .env
npm ci
npm run dev
```

The portal runs at `http://localhost:4173`. Vite proxies `/api` and `/oauth2` to `VITE_API_PROXY_TARGET`, defaulting to `http://localhost:8080`.

## Quality commands

```bash
npm run verify:structure
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify:bundle
npm run security:audit
npm run security:sbom
npm run e2e:list
npm run e2e
npm run check
```

Install the browser once before e2e execution:

```bash
npx playwright install --with-deps chromium
```

## Docker

Build and start the frontend while the backend gateway is available on the host:

```bash
docker compose -f compose.frontend.yml up --build
```

Open `http://localhost:4173`. For a shared backend Docker network, set `API_UPSTREAM` to the gateway service URL and attach the service to that network.

Runtime variables:

| Variable | Default | Purpose |
|---|---:|---|
| `API_UPSTREAM` | `http://api-gateway:8080` | NGINX server-side gateway destination |
| `API_BASE_URL` | empty | Root-relative browser API prefix; cross-origin values are rejected |
| `APP_NAME` | `Atlas Marketplace` | Runtime brand name |
| `APP_RELEASE` | `development` | Release identifier included in telemetry |
| `ORDER_POLLING_MS` | `2000` | Order polling interval, constrained to 1–60 seconds |
| `TELEMETRY_ENDPOINT` | empty | Optional root-relative RUM ingestion path |
| `TELEMETRY_SAMPLE_RATE` | `0` | RUM sampling ratio from 0 to 1 |

The runtime container uses an unprivileged NGINX image, supports a read-only root filesystem, drops Linux capabilities, and validates configuration before starting.

## Project structure

```text
src/api                 Typed client, runtime contracts, retry policy
src/auth                Session lifecycle and role guards
src/components          Banking shell, system recovery, reusable UI
src/features            Customer and administrator workflows
src/observability       Privacy-conscious client telemetry
src/utils               Pure formatting, CSV, navigation, idempotency helpers
e2e                     Playwright journeys, RBAC, accessibility, API mocks
scripts                 Structure and bundle-budget quality gates
docs                    Architecture, security, observability, testing, operations
nginx                    Production edge configuration
```

See `VALIDATION.md` for verified results and environment limitations.
