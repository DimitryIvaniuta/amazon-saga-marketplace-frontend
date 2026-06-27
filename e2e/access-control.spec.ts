import { expect, test } from '@playwright/test';
import { installApiMocks } from './mocks';

test('anonymous deep link is restored after authentication', async ({ page }) => {
  await installApiMocks(page);
  await page.goto('/orders/track?source=bookmark');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email address').fill('buyer@example.com');
  await page.getByLabel('Password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/orders\/track\?source=bookmark$/);
  await expect(page.getByRole('heading', { name: 'Order tracking' })).toBeVisible();
});

test('customer cannot enter administrator routes', async ({ page }) => {
  await installApiMocks(page, 'CUSTOMER');
  await page.goto('/login');
  await page.getByLabel('Email address').fill('buyer@example.com');
  await page.getByLabel('Password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.goto('/admin/inventory');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Good to see you' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Operations' })).toHaveCount(0);
});
