import { test, expect } from '@playwright/test';

test.describe('Toggle todo completion', () => {
  test('can toggle a todo as completed', async ({ page }) => {
    await page.goto('/');

    // Find the first todo item
    const firstTodoItem = page.getByTestId('todo-item').first();
    const firstTodoCheckbox = firstTodoItem.getByTestId('todo-checkbox');
    const firstTodoText = firstTodoItem.locator('span').first();

    // Verify checkbox exists and is unchecked initially
    await expect(firstTodoCheckbox).toBeVisible();
    await expect(firstTodoCheckbox).not.toBeChecked();

    // Verify text is not strikethrough initially
    await expect(firstTodoText).not.toHaveCSS('text-decoration-line', 'line-through');

    // Click the checkbox to mark as completed
    await firstTodoCheckbox.click();

    // Verify checkbox is now checked
    await expect(firstTodoCheckbox).toBeChecked();

    // Verify text has strikethrough styling
    await expect(firstTodoText).toHaveCSS('text-decoration-line', 'line-through');

    // Verify text has lighter color
    await expect(firstTodoText).toHaveCSS('color', 'rgb(136, 136, 136)');
  });

  test('can toggle a completed todo back to incomplete', async ({ page }) => {
    await page.goto('/');

    const firstTodoItem = page.getByTestId('todo-item').first();
    const firstTodoCheckbox = firstTodoItem.getByTestId('todo-checkbox');
    const firstTodoText = firstTodoItem.locator('span').first();

    // Mark as completed first
    await firstTodoCheckbox.click();
    await expect(firstTodoCheckbox).toBeChecked();
    await expect(firstTodoText).toHaveCSS('text-decoration-line', 'line-through');

    // Toggle back to incomplete
    await firstTodoCheckbox.click();

    // Verify checkbox is unchecked
    await expect(firstTodoCheckbox).not.toBeChecked();

    // Verify text is no longer strikethrough
    await expect(firstTodoText).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('completed todo stays in place (not moved)', async ({ page }) => {
    await page.goto('/');

    // Get initial order of todos
    const todoItems = page.getByTestId('todo-item');
    const firstTodoTextBefore = await todoItems.first().locator('span').first().textContent();

    // Mark the first todo as completed
    const firstTodoCheckbox = todoItems.first().getByTestId('todo-checkbox');
    await firstTodoCheckbox.click();

    // Verify the first todo is still in the first position
    const firstTodoTextAfter = await todoItems.first().locator('span').first().textContent();
    expect(firstTodoTextAfter).toBe(firstTodoTextBefore);
  });

  test('multiple todos can be toggled independently', async ({ page }) => {
    await page.goto('/');

    const todoItems = page.getByTestId('todo-item');
    const firstCheckbox = todoItems.nth(0).getByTestId('todo-checkbox');
    const secondCheckbox = todoItems.nth(1).getByTestId('todo-checkbox');
    const thirdCheckbox = todoItems.nth(2).getByTestId('todo-checkbox');

    // Toggle first and third
    await firstCheckbox.click();
    await thirdCheckbox.click();

    // Verify states
    await expect(firstCheckbox).toBeChecked();
    await expect(secondCheckbox).not.toBeChecked();
    await expect(thirdCheckbox).toBeChecked();
  });
});
