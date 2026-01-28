import { test, expect } from '@playwright/test';

type ChangeRequest = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'in_discussion' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
};

type ChangeRequestComment = {
  id: string;
  change_request_id: string;
  author: string;
  content: string;
  created_at: string;
};

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

async function setupChangeRequestMocks(page: import('@playwright/test').Page) {
  const changeRequestId = makeId('cr');
  const now = new Date().toISOString();
  const changeRequests: ChangeRequest[] = [
    {
      id: changeRequestId,
      title: 'Mocked change request',
      description: 'Mocked description',
      status: 'open',
      priority: 'medium',
      created_at: now,
      updated_at: now,
    },
  ];
  const commentsById: Record<string, ChangeRequestComment[]> = {
    [changeRequestId]: [],
  };

  const addRemoteComment = (content: string) => {
    const comment: ChangeRequestComment = {
      id: makeId('comment'),
      change_request_id: changeRequestId,
      author: 'Remote',
      content,
      created_at: new Date().toISOString(),
    };
    commentsById[changeRequestId].push(comment);
    return comment;
  };

  await page.route('**/api/change-requests', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({ json: changeRequests });
      return;
    }
    await route.fallback();
  });

  await page.route('**/api/change-requests/*/comments', async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());
    const segments = url.pathname.split('/');
    const requestId = segments[segments.length - 2];

    if (method === 'GET') {
      await route.fulfill({ json: commentsById[requestId] ?? [] });
      return;
    }

    if (method === 'POST') {
      const payload = route.request().postDataJSON() as { author?: string; content?: string } | null;
      const comment: ChangeRequestComment = {
        id: makeId('comment'),
        change_request_id: requestId,
        author: payload?.author || 'Anonymous',
        content: payload?.content || '',
        created_at: new Date().toISOString(),
      };
      commentsById[requestId] = [...(commentsById[requestId] ?? []), comment];
      await route.fulfill({ status: 201, json: comment });
      return;
    }

    await route.fallback();
  });

  return { changeRequestId, addRemoteComment, createdAt: now };
}

async function setupChangeRequestCreateMocks(page: import('@playwright/test').Page) {
  const changeRequestId = makeId('cr');
  const createdAt = '2026-01-28T05:41:53.123Z';
  const changeRequests: ChangeRequest[] = [];

  await page.route('**/api/change-requests', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({ json: changeRequests });
      return;
    }

    if (method === 'POST') {
      const payload = route.request().postDataJSON() as {
        title?: string;
        description?: string;
        priority?: ChangeRequest['priority'];
      } | null;
      const created: ChangeRequest = {
        id: changeRequestId,
        title: payload?.title ?? 'Untitled',
        description: payload?.description ?? '',
        status: 'open',
        priority: payload?.priority ?? 'medium',
        created_at: createdAt,
        updated_at: createdAt,
      };
      changeRequests.unshift(created);
      await route.fulfill({ status: 201, json: created });
      return;
    }

    await route.fallback();
  });

  await page.route('**/api/change-requests/*/comments', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [] });
      return;
    }
    await route.fallback();
  });

  return { changeRequestId, createdAt };
}

test('shows unread comment badges and clears when read', async ({ page }) => {
  const { changeRequestId, addRemoteComment } = await setupChangeRequestMocks(page);

  await page.goto('/change-requests');
  const card = page.getByTestId(`change-request-card-${changeRequestId}`);
  await expect(card).toBeVisible();

  addRemoteComment('Remote comment 1');

  await expect(card.getByTestId('change-request-unread-count')).toHaveText('1', { timeout: 10000 });

  await page.goto('/');
  await expect(page.getByTestId('change-requests-unread-count')).toHaveText('1', { timeout: 10000 });

  await page.goto('/change-requests');
  const cardAgain = page.getByTestId(`change-request-card-${changeRequestId}`);
  await cardAgain.getByTestId('change-request-comments-toggle').click();
  await expect(page.getByText('Remote comment 1')).toBeVisible();
  await expect(cardAgain.getByTestId('change-request-unread-count')).toHaveCount(0, { timeout: 10000 });

  await page.goto('/');
  await expect(page.getByTestId('change-requests-unread-count')).toHaveCount(0, { timeout: 10000 });
});

test('shows created timestamp with seconds precision', async ({ page }) => {
  const { changeRequestId, createdAt } = await setupChangeRequestMocks(page);

  await page.goto('/change-requests');
  const card = page.getByTestId(`change-request-card-${changeRequestId}`);
  await expect(card).toBeVisible();

  const expectedTimestamp = await page.evaluate((iso) => {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, createdAt);

  await expect(card.getByTestId('change-request-created-at')).toHaveText(`Created: ${expectedTimestamp}`);
});

test('shows created timestamp with seconds precision after creating a request', async ({ page }) => {
  const { changeRequestId, createdAt } = await setupChangeRequestCreateMocks(page);

  await page.goto('/change-requests');
  await page.getByRole('button', { name: 'New Request' }).click();
  await page.getByPlaceholder('Brief title for the request').fill('Seconds precision request');
  await page.getByPlaceholder('Detailed description of the feature or issue...').fill('Ensure created timestamp includes seconds.');
  await page.getByRole('button', { name: 'Submit' }).click();

  const card = page.getByTestId(`change-request-card-${changeRequestId}`);
  await expect(card).toBeVisible();

  const expectedTimestamp = await page.evaluate((iso) => {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, createdAt);

  await expect(card.getByTestId('change-request-created-at')).toHaveText(`Created: ${expectedTimestamp}`);
});

test('fires a notification when new comments arrive', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await page.addInitScript(() => {
    (window as typeof window & { __notifications?: Array<{ title: string; body?: string }> }).__notifications = [];

    class FakeNotification {
      title: string;
      body?: string;

      constructor(title: string, options?: NotificationOptions) {
        this.title = title;
        this.body = options?.body;
        (window as typeof window & { __notifications?: Array<{ title: string; body?: string }> }).__notifications?.push({
          title,
          body: options?.body,
        });
      }

      static permission = 'granted';

      static requestPermission() {
        return Promise.resolve('granted' as NotificationPermission);
      }
    }

    window.Notification = FakeNotification as unknown as typeof Notification;
  });

  const { changeRequestId, addRemoteComment } = await setupChangeRequestMocks(page);

  await page.goto('/change-requests');
  await page.waitForResponse((response) => {
    return response.url().includes(`/api/change-requests/${changeRequestId}/comments`) &&
      response.request().method() === 'GET';
  });

  addRemoteComment('Ping from another browser');

  await expect.poll(async () => {
    return page.evaluate(() => {
      return (window as typeof window & { __notifications?: Array<{ title: string; body?: string }> }).__notifications?.length ?? 0;
    });
  }, { timeout: 10000 }).toBe(1);
});
