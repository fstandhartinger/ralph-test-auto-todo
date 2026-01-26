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

  return { changeRequestId, addRemoteComment };
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
