import { test, expect } from '@playwright/test';

test.describe('Move todo cards across columns', () => {
  test('can move a todo from Todo to In Progress', async ({ page }) => {
    await page.goto('/');

    const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');
    const inProgressColumn = page.locator('[data-testid="kanban-column"][data-status="in_progress"]');

    const card = todoColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Learn React' });
    await expect(card).toBeVisible();

    await card.getByTestId('todo-move-right').click();

    await expect(todoColumn.getByText('Learn React')).toHaveCount(0);
    await expect(inProgressColumn.getByText('Learn React')).toBeVisible();
  });

  test('can move a todo from In Progress to Blocked to Done and back', async ({ page }) => {
    await page.goto('/');

    const inProgressColumn = page.locator('[data-testid="kanban-column"][data-status="in_progress"]');
    const blockedColumn = page.locator('[data-testid="kanban-column"][data-status="blocked"]');
    const doneColumn = page.locator('[data-testid="kanban-column"][data-status="done"]');

    const card = inProgressColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Build a todo app' });
    await expect(card).toBeVisible();

    await card.getByTestId('todo-move-right').click();
    const blockedCard = blockedColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Build a todo app' });
    await expect(blockedCard).toBeVisible();
    await blockedCard.getByTestId('blocked-reason-input').fill('Waiting on API access');
    await blockedCard.getByTestId('blocked-reason-save').click();
    await expect(blockedCard.getByTestId('blocked-reason-display')).toContainText('Waiting on API access');

    await blockedCard.getByTestId('todo-move-right').click();
    await expect(doneColumn.getByText('Build a todo app')).toBeVisible();

    const movedCard = doneColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Build a todo app' });
    await movedCard.getByTestId('todo-move-left').click();

    await expect(blockedColumn.getByText('Build a todo app')).toBeVisible();
  });

  test('edge columns disable unavailable moves', async ({ page }) => {
    await page.goto('/');

    const todoCard = page
      .locator('[data-testid="kanban-column"][data-status="todo"]')
      .locator('[data-testid="todo-item"]').filter({ hasText: 'Learn React' });
    await expect(todoCard.getByTestId('todo-move-left')).toBeDisabled();

    const doneCard = page
      .locator('[data-testid="kanban-column"][data-status="done"]')
      .locator('[data-testid="todo-item"]').filter({ hasText: 'Deploy to production' });
    await expect(doneCard.getByTestId('todo-move-right')).toBeDisabled();
  });
});
