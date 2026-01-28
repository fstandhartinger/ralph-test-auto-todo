import { test, expect } from '@playwright/test';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays theme menu entry', async ({ page }) => {
    await page.goto('/');

    const themeMenu = page.getByTestId('theme-menu');
    await expect(themeMenu).toBeVisible();
  });

  test('starts in light mode by default', async ({ page }) => {
    await page.goto('/');

    // Check that data-theme is not set to dark (light is default)
    const htmlElement = page.locator('html');
    const dataTheme = await htmlElement.getAttribute('data-theme');
    expect(dataTheme === null || dataTheme === 'light').toBeTruthy();

    const themeMenu = page.getByTestId('theme-menu');
    await expect(themeMenu).toHaveValue('light');
  });

  test('switches to dark mode when selected', async ({ page }) => {
    await page.goto('/');

    const themeMenu = page.getByTestId('theme-menu');
    await themeMenu.selectOption('dark');

    // Check that data-theme is now dark
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
    await expect(themeMenu).toHaveValue('dark');
  });

  test('switches back to light mode after selection', async ({ page }) => {
    await page.goto('/');

    const themeMenu = page.getByTestId('theme-menu');

    // Switch to dark
    await themeMenu.selectOption('dark');
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Switch back to light
    await themeMenu.selectOption('light');
    await expect(htmlElement).toHaveAttribute('data-theme', 'light');
    await expect(themeMenu).toHaveValue('light');
  });

  test('persists dark mode preference in localStorage', async ({ page }) => {
    await page.goto('/');

    const themeMenu = page.getByTestId('theme-menu');
    await themeMenu.selectOption('dark');

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

    const themeMenu = page.getByTestId('theme-menu');

    // Switch to dark then back to light
    await themeMenu.selectOption('dark');
    await themeMenu.selectOption('light');

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

    const themeMenu = page.getByTestId('theme-menu');
    await themeMenu.selectOption('dark');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    // Check body background color is dark after the transition
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(10, 10, 10)');
  });

  test('theme menu has correct aria-label', async ({ page }) => {
    await page.goto('/');

    const themeMenu = page.getByTestId('theme-menu');
    await expect(themeMenu).toHaveAttribute('aria-label', 'Farbschema auswählen');
  });

  test('dark mode is available on change-requests page', async ({ page }) => {
    await page.goto('/change-requests');

    const themeMenu = page.getByTestId('theme-menu');
    await expect(themeMenu).toBeVisible();

    // Switch to dark mode
    await themeMenu.selectOption('dark');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
  });

  test('theme preference syncs across pages', async ({ page }) => {
    // Set dark mode on homepage
    await page.goto('/');
    const themeMenu = page.getByTestId('theme-menu');
    await themeMenu.selectOption('dark');

    // Navigate to change-requests
    await page.goto('/change-requests');

    // Should still be in dark mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');

    const changeRequestsMenu = page.getByTestId('theme-menu');
    await expect(changeRequestsMenu).toHaveValue('dark');
  });
});
