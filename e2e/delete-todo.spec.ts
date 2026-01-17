import { test, expect } from '@playwright/test';

test.describe('Delete todo', () => {
  test('can delete a todo item', async ({ page }) => {
    await page.goto('/');

    // Get initial count of todos
    const todoItems = page.getByTestId('todo-item');
    const initialCount = await todoItems.count();
    expect(initialCount).toBeGreaterThan(0);

    // Get the title of the first todo to verify it's deleted
    const firstTodoTitle = await todoItems.first().locator('span').first().textContent();

    // Click the delete button on the first todo
    const firstDeleteButton = todoItems.first().getByTestId('delete-todo-button');
    await expect(firstDeleteButton).toBeVisible();
    await firstDeleteButton.click();

    // Verify the todo count decreased by 1
    await expect(todoItems).toHaveCount(initialCount - 1);

    // Verify the deleted todo is no longer in the list
    const remainingTitles = await todoItems.locator('span').first().allTextContents();
    expect(remainingTitles).not.toContain(firstTodoTitle);
  });

  test('can delete all todos one by one', async ({ page }) => {
    await page.goto('/');

    const todoItems = page.getByTestId('todo-item');
    const initialCount = await todoItems.count();

    // Delete todos one by one
    for (let i = 0; i < initialCount; i++) {
      const deleteButton = page.getByTestId('delete-todo-button').first();
      await deleteButton.click();
    }

    // Verify all todos are deleted
    await expect(todoItems).toHaveCount(0);
  });

  test('delete button exists on each todo item', async ({ page }) => {
    await page.goto('/');

    const todoItems = page.getByTestId('todo-item');
    const count = await todoItems.count();

    // Verify each todo has a delete button
    for (let i = 0; i < count; i++) {
      const deleteButton = todoItems.nth(i).getByTestId('delete-todo-button');
      await expect(deleteButton).toBeVisible();
    }
  });
});
