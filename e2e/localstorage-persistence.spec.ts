import { test, expect } from '@playwright/test';

const LOCAL_STORAGE_KEY = 'ralph-todos';

test.describe('LocalStorage persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate((key) => localStorage.removeItem(key), LOCAL_STORAGE_KEY);
  });

  test('todos persist after page reload', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    // Add a new todo
    await input.fill('Persistent todo item');
    await input.press('Enter');

    // Verify the todo is visible
    await expect(page.getByText('Persistent todo item')).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify the todo is still visible after reload
    await expect(page.getByText('Persistent todo item')).toBeVisible();
  });

  test('completed state persists after page reload', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    // Add a new todo
    await input.fill('Todo to complete');
    await input.press('Enter');

    // Find and toggle the new todo using the checkbox
    const todoItemContainer = page.locator('[data-testid="todo-item"]').filter({ hasText: 'Todo to complete' });
    const checkbox = todoItemContainer.getByTestId('todo-checkbox');
    const todoText = todoItemContainer.locator('span').first();
    await expect(checkbox).toBeVisible();
    await checkbox.click();

    // Verify it has line-through style (completed)
    await expect(todoText).toHaveCSS('text-decoration-line', 'line-through');

    // Reload the page
    await page.reload();

    // Verify the todo is still completed after reload
    const persistedTodoContainer = page.locator('[data-testid="todo-item"]').filter({ hasText: 'Todo to complete' });
    const persistedCheckbox = persistedTodoContainer.getByTestId('todo-checkbox');
    const persistedTodoText = persistedTodoContainer.locator('span').first();
    await expect(persistedTodoText).toBeVisible();
    await expect(persistedCheckbox).toBeChecked();
    await expect(persistedTodoText).toHaveCSS('text-decoration-line', 'line-through');
  });

  test('app works correctly with empty localStorage', async ({ page }) => {
    // Ensure localStorage is empty
    await page.evaluate((key) => localStorage.removeItem(key), LOCAL_STORAGE_KEY);

    await page.goto('/');

    // App should load without errors
    const input = page.getByTestId('todo-input');
    await expect(input).toBeVisible();

    // Should be able to add a todo
    await input.fill('New todo with empty storage');
    await input.press('Enter');

    await expect(page.getByText('New todo with empty storage')).toBeVisible();
  });

  test('app handles corrupted localStorage gracefully', async ({ page }) => {
    // Set corrupted data in localStorage
    await page.evaluate((key) => {
      localStorage.setItem(key, 'this is not valid JSON');
    }, LOCAL_STORAGE_KEY);

    await page.goto('/');

    // App should load without crashing
    const input = page.getByTestId('todo-input');
    await expect(input).toBeVisible();

    // Should be able to add a todo
    await input.fill('Todo after corrupted storage');
    await input.press('Enter');

    await expect(page.getByText('Todo after corrupted storage')).toBeVisible();
  });

  test('deleted todos are removed from localStorage', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    // Add a new todo
    await input.fill('Todo to delete');
    await input.press('Enter');

    // Verify the todo is visible
    const todoText = page.getByText('Todo to delete');
    await expect(todoText).toBeVisible();

    // Delete the todo
    // We need to find the delete button associated with our specific todo
    const todoItem = page.locator('[data-testid="todo-item"]').filter({ hasText: 'Todo to delete' });
    await todoItem.getByRole('button', { name: 'Delete' }).click();

    // Verify the todo is gone
    await expect(page.getByText('Todo to delete')).not.toBeVisible();

    // Reload the page
    await page.reload();

    // Verify the todo is still gone after reload
    await expect(page.getByText('Todo to delete')).not.toBeVisible();
  });
});
