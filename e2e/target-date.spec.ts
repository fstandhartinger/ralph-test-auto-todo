import { test, expect } from '@playwright/test';

test.describe('Target date functionality', () => {
  test('can add a todo with a target date', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    const dateInput = page.getByTestId('target-date-input');
    const addButton = page.getByTestId('add-todo-button');

    await expect(input).toBeVisible();
    await expect(dateInput).toBeVisible();
    await expect(addButton).toBeVisible();

    // Add a new todo with a target date
    await input.fill('Todo with due date');
    await dateInput.fill('2026-02-15');
    await addButton.click();

    // Verify the new todo appears in the list
    await expect(page.getByText('Todo with due date')).toBeVisible();

    // Verify the target date is displayed
    await expect(page.getByTestId('target-date-display').last()).toBeVisible();
    await expect(page.getByTestId('target-date-display').last()).toContainText('Due:');

    // Verify input is cleared after submission
    await expect(input).toHaveValue('');
    await expect(dateInput).toHaveValue('');
  });

  test('can add a todo without a target date', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    const dateInput = page.getByTestId('target-date-input');
    const addButton = page.getByTestId('add-todo-button');

    // Get initial count of target date displays
    await expect(page.getByTestId('todo-item').first()).toBeVisible();
    const initialDateDisplayCount = await page.getByTestId('target-date-display').count();

    // Add a new todo without a target date
    await input.fill('Todo without due date');
    await addButton.click();

    // Verify the new todo appears in the list
    await expect(page.getByText('Todo without due date')).toBeVisible();

    // Verify no new target date display was added
    await expect(page.getByTestId('target-date-display')).toHaveCount(initialDateDisplayCount);

    // Verify date input remains empty (wasn't auto-filled)
    await expect(dateInput).toHaveValue('');
  });

  test('target date persists after page reload', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    const dateInput = page.getByTestId('target-date-input');
    const addButton = page.getByTestId('add-todo-button');

    // Add a new todo with a target date
    await input.fill('Persistent dated todo');
    await dateInput.fill('2026-03-20');
    await addButton.click();

    // Verify the todo and date are visible
    await expect(page.getByText('Persistent dated todo')).toBeVisible();
    await expect(page.getByTestId('target-date-display').last()).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify the todo and date persist after reload
    await expect(page.getByText('Persistent dated todo')).toBeVisible();
    await expect(page.getByTestId('target-date-display').last()).toBeVisible();
  });
});
