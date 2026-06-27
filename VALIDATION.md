# Validation report

Validation date: 2026-06-21.

## Passed in the available runner

- Lock-file consistency and dependency installation.
- Structural verification: 27 required artifacts, 11 backend route mappings, and 67 TypeScript sources.
- Central HTTP-boundary guard, no persistent `localStorage`, runtime response schemas, and globally disabled mutation retries.
- ESLint with zero warnings.
- Strict TypeScript 6 project compilation.
- 47 Vitest tests across 16 files.
- Coverage gates passed:
  - statements: 89.47%;
  - branches: 84.00%;
  - functions: 87.50%;
  - lines: 92.00%.
- Production Vite build completed with route-level code splitting.
- Bundle budgets passed:
  - largest JavaScript asset: 263.6 KiB;
  - total JavaScript: 463.1 KiB;
  - total CSS: 30.6 KiB.
- `npm audit --audit-level=high`: zero known vulnerabilities.
- CycloneDX production SBOM generated and parsed as valid JSON.
- Playwright discovery passed: 16 desktop/mobile executions from 6 specifications.
- Runtime-config script passed shell syntax and valid-value execution.
- Unsafe absolute API destinations, malformed telemetry rates, and out-of-range values fail closed.
- JSON and YAML parsing passed.
- Git whitespace validation passed.

## Browser execution limitation

A focused Playwright execution was attempted with the runner's installed Chromium. The browser was launched, but runner policy blocked navigation to `http://127.0.0.1:4173` with `ERR_BLOCKED_BY_ADMINISTRATOR` before application code loaded. Browser source, mocks, TypeScript compilation, and discovery are validated here, but the 16 e2e executions are not claimed as runtime-passed in this environment.

The included GitHub Actions workflow installs official Playwright Chromium and runs the complete desktop/mobile, access-control, and axe-core accessibility suite on every push and pull request.

## Container execution limitation

Docker is not installed in the available runner, so the final image could not be built or started locally. Dockerfile, Compose, NGINX template, runtime script, and CI container-health workflow were inspected and statically validated. CI builds the image, starts it with a read-only filesystem and dropped capabilities, and verifies `/healthz`.

## Environment note

The runner provides Node.js 22.16.0, while React Router 8 and this repository require Node.js 22.22 or newer. All commands completed except the environment-blocked browser/container executions. CI and Docker use the pinned Node.js 24.17.0 runtime.

## Reproduction

```bash
nvm use
npm ci
npm run security:audit
npm run check
npm run security:sbom
npx playwright install --with-deps chromium
npm run e2e
docker build -t amazon-saga-marketplace-frontend:1.1.0 .
docker compose -f compose.frontend.yml up --build
```
