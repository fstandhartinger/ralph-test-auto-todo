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

  test('column state persists after page reload', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    // Add a new todo
    await input.fill('Todo to move');
    await input.press('Enter');

    const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');
    const inProgressColumn = page.locator('[data-testid="kanban-column"][data-status="in_progress"]');
    const doneColumn = page.locator('[data-testid="kanban-column"][data-status="done"]');

    const todoCard = todoColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Todo to move' });
    await todoCard.getByTestId('todo-move-right').click();

    const inProgressCard = inProgressColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Todo to move' });
    await inProgressCard.getByTestId('todo-move-right').click();

    await expect(doneColumn.getByText('Todo to move')).toBeVisible();

    // Reload the page
    await page.reload();

    // Verify the todo is still in the done column after reload
    const persistedDoneColumn = page.locator('[data-testid="kanban-column"][data-status="done"]');
    await expect(persistedDoneColumn.getByText('Todo to move')).toBeVisible();
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
    await todoItem.getByTestId('delete-todo-button').click();

    // Verify the todo is gone
    await expect(page.getByText('Todo to delete')).not.toBeVisible();

    // Reload the page
    await page.reload();

    // Verify the todo is still gone after reload
    await expect(page.getByText('Todo to delete')).not.toBeVisible();
  });
});
