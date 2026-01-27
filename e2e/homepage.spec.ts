import { test, expect } from '@playwright/test';

test('homepage displays the title', async ({ page }) => {
  await page.goto('/');

  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('ralph-test-auto-todo');
});

test('homepage has correct page title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/ralph-test-auto-todo/);
});

test('homepage displays kanban board columns with starter cards', async ({ page }) => {
  await page.goto('/');

  const kanbanBoard = page.getByTestId('kanban-board');
  await expect(kanbanBoard).toBeVisible();

  const columns = page.getByTestId('kanban-column');
  await expect(columns).toHaveCount(3);

  const todoColumn = page.locator('[data-testid="kanban-column"][data-status="todo"]');
  const inProgressColumn = page.locator('[data-testid="kanban-column"][data-status="in_progress"]');
  const doneColumn = page.locator('[data-testid="kanban-column"][data-status="done"]');

  await expect(todoColumn.getByTestId('todo-item')).toHaveCount(1);
  await expect(inProgressColumn.getByTestId('todo-item')).toHaveCount(1);
  await expect(doneColumn.getByTestId('todo-item')).toHaveCount(1);
});

test('each starter card displays its title in the correct column', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.locator('[data-testid="kanban-column"][data-status="todo"]').getByText('Learn React')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="kanban-column"][data-status="in_progress"]').getByText('Build a todo app')
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="kanban-column"][data-status="done"]').getByText('Deploy to production')
  ).toBeVisible();
});
