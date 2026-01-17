import { test, expect } from '@playwright/test';

test('homepage displays the title', async ({ page }) => {
  await page.goto('/');

  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('ralph-test-auto-todo');
});

test('homepage has correct page title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/ralph-test-auto-todo/);
});
