import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { installApiMocks } from './mocks';

/**
 * Runs automated WCAG checks on representative public and authenticated pages.
 * Keyboard and transaction behavior remain covered by the journey tests.
 */
test('public catalog has no automatically detectable accessibility violations', async ({ page }) => {
  await installApiMocks(page);
  await page.goto('/catalog');
  await expect(page.getByRole('heading', { name: /shop confidently/i })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('authenticated dashboard has no automatically detectable accessibility violations', async ({ page }) => {
  await installApiMocks(page);
  await page.goto('/login');
  await page.getByLabel('Email address').fill('buyer@example.com');
  await page.getByLabel('Password').fill('LongPassword123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Good to see you' })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
