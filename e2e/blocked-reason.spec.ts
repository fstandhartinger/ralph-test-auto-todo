import { test, expect } from '@playwright/test';

test.describe('Blocked reason flow', () => {
  test('can save and edit a blocked reason with a timestamp', async ({ page }) => {
    await page.goto('/');

    const input = page.getByTestId('todo-input');
    await input.fill('Blocked item');
    await input.press('Enter');

    const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');
    const inProgressColumn = page.locator('[data-testid="kanban-column"][data-status="in_progress"]');
    const blockedColumn = page.locator('[data-testid="kanban-column"][data-status="blocked"]');

    const todoCard = todoColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Blocked item' });
    await todoCard.getByTestId('todo-move-right').click();

    const inProgressCard = inProgressColumn
      .locator('[data-testid="todo-item"]')
      .filter({ hasText: 'Blocked item' });
    await inProgressCard.getByTestId('todo-move-right').click();

    const blockedCard = blockedColumn.locator('[data-testid="todo-item"]').filter({ hasText: 'Blocked item' });
    await expect(blockedCard).toBeVisible();

    await blockedCard.getByTestId('blocked-reason-input').fill('Waiting on design feedback');
    await blockedCard.getByTestId('blocked-reason-save').click();

    await expect(blockedCard.getByTestId('blocked-reason-display')).toContainText('Waiting on design feedback');
    const initialTimestamp = await blockedCard.getByTestId('blocked-reason-timestamp').innerText();
    expect(initialTimestamp).toMatch(/\d{2}:\d{2}:\d{2}/);

    await page.waitForTimeout(50);

    await blockedCard.getByTestId('blocked-reason-edit').click();
    await blockedCard.getByTestId('blocked-reason-input').fill('Waiting on final approval');
    await blockedCard.getByTestId('blocked-reason-save').click();

    await expect(blockedCard.getByTestId('blocked-reason-display')).toContainText('Waiting on final approval');
    const updatedTimestamp = await blockedCard.getByTestId('blocked-reason-timestamp').innerText();
    expect(updatedTimestamp).not.toBe(initialTimestamp);
  });
});
