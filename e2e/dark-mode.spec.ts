import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays theme toggle button', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
  });

  test('starts in light mode by default', async ({ page }) => {
    await page.goto('/');

    // Check that data-theme is not set to dark (light is default)
    const htmlElement = page.locator('html');
    const dataTheme = await htmlElement.getAttribute('data-theme');
    expect(dataTheme === null || dataTheme === 'light').toBeTruthy();

    // Toggle should show moon icon for light mode
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toContainText('🌙');
  });

  test('toggles to dark mode when clicked', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();

    // Check that data-theme is now dark
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Toggle should now show sun icon
    await expect(themeToggle).toContainText('☀️');
  });

  test('toggles back to light mode on second click', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');

    // Toggle to dark
    await themeToggle.click();
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Toggle back to light
    await themeToggle.click();
    await expect(htmlElement).toHaveAttribute('data-theme', 'light');
    await expect(themeToggle).toContainText('🌙');
  });

  test('persists dark mode preference in localStorage', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();

    // Verify localStorage was updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('ralph-theme'));
    expect(storedTheme).toBe('dark');

    // Reload and verify persistence
    await page.reload();
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
  });

  test('persists light mode preference in localStorage', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');

    // Toggle to dark then back to light
    await themeToggle.click();
    await themeToggle.click();

    // Verify localStorage was updated
    const storedTheme = await page.evaluate(() => localStorage.getItem('ralph-theme'));
    expect(storedTheme).toBe('light');

    // Reload and verify persistence
    await page.reload();
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'light');
  });

  test('dark mode applies correct background color', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Check body background color is dark after the transition
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(10, 10, 10)');
  });

  test('theme toggle has correct aria-label', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.getByTestId('theme-toggle');

    // In light mode, should suggest switching to dark
    await expect(themeToggle).toHaveAttribute('aria-label', 'Switch to dark mode');

    // After toggle, should suggest switching to light
    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  test('dark mode is available on change-requests page', async ({ page }) => {
    await page.goto('/change-requests');

    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();

    // Toggle to dark mode
    await themeToggle.click();

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
  });

  test('theme preference syncs across pages', async ({ page }) => {
    // Set dark mode on homepage
    await page.goto('/');
    const themeToggle = page.getByTestId('theme-toggle');
    await themeToggle.click();

    // Navigate to change-requests
    await page.goto('/change-requests');

    // Should still be in dark mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Toggle should show sun icon
    const changeRequestsToggle = page.getByTestId('theme-toggle');
    await expect(changeRequestsToggle).toContainText('☀️');
  });
});
