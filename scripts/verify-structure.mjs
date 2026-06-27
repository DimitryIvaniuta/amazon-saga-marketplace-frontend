import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const requiredFiles = [
  'src/api/schemas.ts',
  'src/api/retry.ts',
  'src/observability/telemetry.ts',
  'src/components/system/AppErrorBoundary.tsx',
  'src/components/system/ConnectivityBanner.tsx',
  'src/components/system/RouteEffects.tsx',
  'src/components/system/ToastProvider.tsx',
  'src/features/auth/LoginPage.tsx',
  'src/features/auth/RegisterPage.tsx',
  'src/features/catalog/CatalogPage.tsx',
  'src/features/catalog/ProductPage.tsx',
  'src/features/cart/CartPage.tsx',
  'src/features/checkout/CheckoutPage.tsx',
  'src/features/orders/OrderTrackingPage.tsx',
  'src/features/shipping/ShippingPage.tsx',
  'src/features/admin/AdminDashboardPage.tsx',
  'src/features/admin/ProductCreatePage.tsx',
  'src/features/admin/InventoryPage.tsx',
  'src/features/admin/PaymentLookupPage.tsx',
  'src/features/admin/AuditPage.tsx',
  'e2e/customer-checkout.spec.ts',
  'e2e/admin-operations.spec.ts',
  'e2e/access-control.spec.ts',
  'e2e/accessibility.spec.ts',
  'scripts/check-bundle.mjs',
  'Dockerfile',
  'nginx/default.conf.template',
];

await Promise.all(requiredFiles.map((file) => stat(file)));

const endpoints = await readFile('src/api/endpoints.ts', 'utf8');
const requiredRoutes = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/catalog/products',
  '/api/cart',
  '/api/orders/checkout',
  '/api/shipping/orders/',
  '/api/admin/catalog/products',
  '/api/admin/inventory',
  '/api/admin/inventory/hot-skus',
  '/api/admin/payments/orders/',
  '/api/admin/audit/',
];

for (const route of requiredRoutes) {
  if (!endpoints.includes(route)) throw new Error(`Missing backend route mapping: ${route}`);
}

const sourceFiles = (await walk('src')).filter((file) => /\.(?:ts|tsx)$/.test(file));
const source = await Promise.all(sourceFiles.map(async (file) => [file, await readFile(file, 'utf8')]));
const persistentTokenUse = source.filter(([, text]) => text.includes('localStorage'));
if (persistentTokenUse.length > 0) {
  throw new Error(`Persistent browser storage is not allowed: ${persistentTokenUse.map(([file]) => file).join(', ')}`);
}

const directFetchUse = source.filter(([file, text]) => /\bfetch\s*\(/.test(text) && !['src/api/client.ts', 'src/observability/telemetry.ts'].includes(file));
if (directFetchUse.length > 0) {
  throw new Error(`HTTP calls must use the central client: ${directFetchUse.map(([file]) => file).join(', ')}`);
}

const providers = await readFile('src/app/Providers.tsx', 'utf8');
if (!providers.includes('mutations: { retry: false }')) throw new Error('Mutation retries must remain globally disabled.');
if (!endpoints.includes('schema:')) throw new Error('Backend response schemas are not connected to the HTTP boundary.');

console.log(`Verified ${requiredFiles.length} required files, ${requiredRoutes.length} backend routes, and ${sourceFiles.length} frontend sources.`);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const item = path.join(directory, entry.name).replaceAll('\\', '/');
    return entry.isDirectory() ? walk(item) : [item];
  }));
  return nested.flat();
}
