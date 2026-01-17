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

test('homepage displays todo list with at least 3 todos', async ({ page }) => {
  await page.goto('/');

  const todoList = page.getByTestId('todo-list');
  await expect(todoList).toBeVisible();

  const todoItems = page.getByTestId('todo-item');
  await expect(todoItems).toHaveCount(3);
});

test('each todo item displays its title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Learn React')).toBeVisible();
  await expect(page.getByText('Build a todo app')).toBeVisible();
  await expect(page.getByText('Deploy to production')).toBeVisible();
});
