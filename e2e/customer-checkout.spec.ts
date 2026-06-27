import { expect, test } from '@playwright/test';
import { installApiMocks } from './mocks';

test('customer completes cart and idempotent checkout flow', async ({ page }) => {
  await installApiMocks(page);
  await page.goto('/login');
  await page.getByLabel('Email address').fill('buyer@example.com');
  await page.getByLabel('Password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Good to see you' })).toBeVisible();

  await page.getByRole('link', { name: 'Marketplace' }).click();
  await page.getByRole('link', { name: /view product/i }).click();
  await page.getByRole('button', { name: /add to cart/i }).click();
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
  await page.getByRole('link', { name: /continue to secure checkout/i }).click();

  await page.getByLabel('Recipient').fill('Buyer Test');
  await page.getByLabel('Address').fill('Main Street 1');
  await page.getByLabel('City').fill('Warsaw');
  await page.getByLabel('Postal code').fill('00-001');
  await page.getByLabel('Payment token').fill('tok_success');
  await page.getByRole('button', { name: /authorize and place order/i }).click();

  await expect(page.getByRole('heading', { name: 'Order tracking' })).toBeVisible();
  await expect(page.getByText('Completed', { exact: true }).first()).toBeVisible({ timeout: 8_000 });
  await page.getByRole('link', { name: /view shipment/i }).click();
  await expect(page.getByText('ATL-2026-00001')).toBeVisible();
});
