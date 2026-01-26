import { test, expect } from '@playwright/test';

// Mobile viewport dimensions (iPhone SE)
const MOBILE_VIEWPORT = { width: 375, height: 667 };

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test('homepage displays correctly on mobile', async ({ page }) => {
    await page.goto('/');

    // Check heading is visible and fits within viewport
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('ralph-test-auto-todo');

    // Verify heading box is within viewport width
    const headingBox = await heading.boundingBox();
    expect(headingBox).toBeTruthy();
    expect(headingBox!.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
  });

  test('add todo form is usable on mobile', async ({ page }) => {
    await page.goto('/');

    // Check that the input and button are visible
    const input = page.getByTestId('todo-input');
    const addButton = page.getByTestId('add-todo-button');

    await expect(input).toBeVisible();
    await expect(addButton).toBeVisible();

    // Test that we can add a todo on mobile
    await input.fill('Mobile test todo');
    await addButton.click();

    // Verify the new todo appears
    await expect(page.getByText('Mobile test todo')).toBeVisible();
  });

  test('todo items display correctly on mobile', async ({ page }) => {
    await page.goto('/');

    // Wait for todos to load
    await page.waitForSelector('[data-testid="todo-item"]');

    const todoItems = page.getByTestId('todo-item');
    const count = await todoItems.count();
    expect(count).toBeGreaterThan(0);

    // Check that todo items have proper layout
    const firstTodoBox = await todoItems.first().boundingBox();
    expect(firstTodoBox).toBeTruthy();
    expect(firstTodoBox!.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
  });

  test('change requests link is accessible on mobile', async ({ page }) => {
    await page.goto('/');

    // The "Change Requests" link should be visible
    const link = page.getByRole('link', { name: 'Change Requests' });
    await expect(link).toBeVisible();

    // Navigate to change requests page
    await link.click();
    await expect(page).toHaveURL('/change-requests');
  });

  test('change requests page displays correctly on mobile', async ({ page }) => {
    await page.goto('/change-requests');

    // Check heading is visible
    const heading = page.getByRole('heading', { name: 'Change Requests' });
    await expect(heading).toBeVisible();

    // Check that the "New Request" button is visible
    const newRequestButton = page.getByRole('button', { name: /New Request/ });
    await expect(newRequestButton).toBeVisible();

    // Check that the back link is visible
    const backLink = page.getByRole('link', { name: 'Back to Todos' });
    await expect(backLink).toBeVisible();
  });

  test('new request form is usable on mobile', async ({ page }) => {
    await page.goto('/change-requests');

    // Click "New Request" button
    const newRequestButton = page.getByRole('button', { name: /New Request/ });
    await newRequestButton.click();

    // Check form elements are visible
    const titleInput = page.getByPlaceholder('Brief title for the request');
    const descriptionTextarea = page.getByPlaceholder('Detailed description');
    const submitButton = page.getByRole('button', { name: /Submit/ });

    await expect(titleInput).toBeVisible();
    await expect(descriptionTextarea).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Check form fits within viewport
    const formBox = await page.locator('form').boundingBox();
    expect(formBox).toBeTruthy();
    expect(formBox!.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
  });

  test('no horizontal scrollbar on mobile homepage', async ({ page }) => {
    await page.goto('/');

    // Check that there's no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // Allow small tolerance for rounding
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('no horizontal scrollbar on mobile change requests page', async ({ page }) => {
    await page.goto('/change-requests');

    // Wait for content to load
    await page.waitForSelector('main');

    // Check that there's no horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    // Allow small tolerance for rounding
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});
