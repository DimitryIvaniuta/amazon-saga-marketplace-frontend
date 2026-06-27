import { expect, test } from '@playwright/test';
import { installApiMocks } from './mocks';

test('administrator can inspect inventory and hot SKU diagnostics', async ({ page }) => {
  await installApiMocks(page, 'ADMIN');
  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin@example.com');
  await page.getByLabel('Password').fill('ChangeMe12345!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('link', { name: 'Operations' }).click();
  await expect(page.getByRole('heading', { name: 'Marketplace operations' })).toBeVisible();
  await page.getByRole('link', { name: /manage inventory/i }).click();
  await expect(page.getByRole('heading', { name: 'Inventory and hot SKUs' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1300' })).toBeVisible();
  await expect(page.getByText('812 µs')).toBeVisible();
});
