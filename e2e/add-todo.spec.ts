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

    // Verify the new todo appears in the list
    await expect(page.getByText('My new todo item')).toBeVisible();

    // Verify input is cleared after submission
    await expect(input).toHaveValue('');
  });

  test('can add a new todo by pressing Enter', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    await input.fill('Todo added with Enter');
    await input.press('Enter');

    // Verify the new todo appears in the list
    await expect(page.getByText('Todo added with Enter')).toBeVisible();

    // Verify input is cleared
    await expect(input).toHaveValue('');
  });

  test('cannot add empty todo', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    const addButton = page.getByTestId('add-todo-button');
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
    const initialTodoCount = await page.getByTestId('todo-item').count();

    // Try to add empty todo via Enter
    await input.press('Enter');

    // Verify no new todo was added
    await expect(page.getByTestId('todo-item')).toHaveCount(initialTodoCount);
  });

  test('new todo has unique ID and is not completed', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');

    // Add a new todo
    await input.fill('Check todo properties');
    await input.press('Enter');

    // The new todo should appear and not be styled as completed (no line-through)
    const newTodo = page.getByText('Check todo properties');
    await expect(newTodo).toBeVisible();
    await expect(newTodo).not.toHaveCSS('text-decoration', /line-through/);
  });
});
