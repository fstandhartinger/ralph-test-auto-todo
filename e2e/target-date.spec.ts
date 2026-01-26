import { test, expect } from '@playwright/test';

test.describe('Target date for todos', () => {
  test('can add a todo with a target date', async ({ page }) => {
    await page.goto('/');

    const title = 'Pay rent';
    const dateValue = '2026-02-01';

    await page.getByTestId('todo-input').fill(title);
    await page.getByTestId('target-date-input').fill(dateValue);
    await page.getByTestId('add-todo-button').click();

    const todoItem = page.getByTestId('todo-item').filter({ hasText: title });
    await expect(todoItem).toBeVisible();

    const expectedDate = await page.evaluate(
      (value) => new Date(value).toLocaleDateString(),
      dateValue
    );
    await expect(todoItem.getByTestId('target-date-display')).toHaveText(
      `Due: ${expectedDate}`
    );
  });

  test('target date is optional', async ({ page }) => {
    await page.goto('/');

    const title = 'No due date task';

    await page.getByTestId('todo-input').fill(title);
    await page.getByTestId('add-todo-button').click();

    const todoItem = page.getByTestId('todo-item').filter({ hasText: title });
    await expect(todoItem).toBeVisible();
    await expect(todoItem.getByTestId('target-date-display')).toHaveCount(0);
  });
});
