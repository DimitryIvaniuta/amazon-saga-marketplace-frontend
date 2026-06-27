import { expect, test } from '@playwright/test';
import { installApiMocks, product } from './mocks';

test('guest can browse catalog and inspect variants', async ({ page }) => {
  await installApiMocks(page);
  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: /shop confidently/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await page.getByRole('link', { name: /view product/i }).click();
  await expect(page.getByRole('heading', { name: product.name })).toBeVisible();
  await expect(page.getByRole('button', { name: /TSHIRT-BLK-L/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in to purchase/i })).toBeVisible();
});
