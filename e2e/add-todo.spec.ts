import { test, expect } from '@playwright/test';

test.describe('Add todo functionality', () => {
  test('can add a new todo via input field and button', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    const addButton = page.getByTestId('add-todo-button');

    await expect(input).toBeVisible();
    await expect(addButton).toBeVisible();

    // Add a new todo
    await input.fill('My new todo item');
    await addButton.click();

    const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');

    // Verify the new todo appears in the todo column
    await expect(todoColumn.getByText('My new todo item')).toBeVisible();

    // Verify input is cleared after submission
    await expect(input).toHaveValue('');
  });

  test('can add a new todo by pressing Enter', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    await input.fill('Todo added with Enter');
    await input.press('Enter');

    const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');

    // Verify the new todo appears in the todo column
    await expect(todoColumn.getByText('Todo added with Enter')).toBeVisible();

    // Verify input is cleared
    await expect(input).toHaveValue('');
  });

  test('cannot add empty todo', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    const addButton = page.getByTestId('add-todo-button');
    // Wait for todos to load before counting
    await expect(page.getByTestId('todo-item').first()).toBeVisible();
    const initialTodoCount = await page.getByTestId('todo-item').count();

    // Try to add empty todo via button click
    await addButton.click();

    // Verify no new todo was added
    await expect(page.getByTestId('todo-item')).toHaveCount(initialTodoCount);

    // Try to add whitespace-only todo
    await input.fill('   ');
    await addButton.click();

    // Verify no new todo was added
    await expect(page.getByTestId('todo-item')).toHaveCount(initialTodoCount);
  });

  test('cannot add empty todo via Enter key', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    // Wait for todos to load before counting
    await expect(page.getByTestId('todo-item').first()).toBeVisible();
    const initialTodoCount = await page.getByTestId('todo-item').count();

    // Try to add empty todo via Enter
    await input.press('Enter');

    // Verify no new todo was added
    await expect(page.getByTestId('todo-item')).toHaveCount(initialTodoCount);
  });

  test('new todo starts in the Todo column', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    // Add a new todo
    await input.fill('Check todo properties');
    await input.press('Enter');

    const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');
    const newTodo = todoColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Check todo properties' });

    await expect(newTodo).toBeVisible();
    await expect(newTodo.getByTestId('todo-move-left')).toBeDisabled();
  });
});
