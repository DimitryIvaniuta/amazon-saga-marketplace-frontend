import { expect, test } from '@playwright/test';
import { installApiMocks } from './mocks';

test('mobile customer can open the banking navigation drawer', async ({ page }) => {
  await installApiMocks(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await page.getByLabel('Email address').fill('buyer@example.com');
  await page.getByLabel('Password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
});
