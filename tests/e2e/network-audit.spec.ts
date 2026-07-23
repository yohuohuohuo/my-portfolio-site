import { expect, test } from '@playwright/test';

const localHosts = new Set(['127.0.0.1', 'localhost']);

async function enterDemo(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Enter Demo' }).click();
  await expect(page.getByText('Demo ID 1001')).toBeVisible({ timeout: 10000 });
}

async function openMenu(page: import('@playwright/test').Page, name: string) {
  await page.getByText(name, { exact: true }).first().click();
  await page.waitForTimeout(250);
}

async function closeDesktopModal(page: import('@playwright/test').Page) {
  if (test.info().project.name === 'desktop') {
    await expect(page.locator('.ReactModal__Content').first()).toBeVisible();
    await page.keyboard.press('Escape');
  } else {
    await page.reload();
    await expect(page.getByText('Demo ID 1001')).toBeVisible({ timeout: 10000 });
  }
}

test('keeps the complete portfolio and Mint Forest flow on same-origin requests', async ({ page }) => {
  test.setTimeout(120000);

  const unexpectedRequests: string[] = [];
  const failedResponses: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!['http:', 'https:'].includes(url.protocol)) return;
    if (!localHosts.has(url.hostname)) unexpectedRequests.push(request.url());
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (!['http:', 'https:'].includes(url.protocol)) return;
    if (response.status() < 400) return;
    if (url.pathname.startsWith('/_next/static/webpack/')) return;
    failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/');
  await expect(page.getByTestId('project-mint-forest')).toBeVisible();
  await page.getByTestId('project-mint-forest').getByRole('link', { name: /open mint forest/i }).click();
  await expect(page).toHaveURL(/\/mint-forest$/);

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await enterDemo(page);

  await page.getByAltText('green id box').click();
  await page.getByRole('button', { name: 'Activate it' }).click();
  await expect(page.getByText('GreenID Boost: 0.0%')).toBeVisible({ timeout: 10000 });
  await page.getByTestId('green-id-close').click();

  await page.getByTestId('bubble-daily').click({ force: true });
  await page.waitForTimeout(350);

  if (test.info().project.name === 'desktop') {
    const search = page.getByPlaceholder('Search Forest ID').first();
    await search.fill('2001');
    await expect(page.getByTestId('search-result-2001')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('search-result-2001').click();
    await expect(page).toHaveURL(/\/mint-forest\?id=2001/);
    await expect(page.getByTestId('other-forest-header')).toBeVisible({ timeout: 5000 });
    await page.goBack();
    await expect(page).toHaveURL(/\/mint-forest$/);
    await expect(page.getByText('Demo ID 1001')).toBeVisible({ timeout: 10000 });
  }

  for (const menu of ['Task', 'LB', 'Lucky']) {
    await openMenu(page, menu);
    await closeDesktopModal(page);
  }

  if (test.info().project.name === 'desktop') {
    await page.getByText('My', { exact: true }).click();
    for (const menu of ['Invite', 'BP', 'News']) {
      await openMenu(page, menu);
      await closeDesktopModal(page);
      if (menu !== 'News') {
        await page.getByText('My', { exact: true }).click();
      }
    }
  }

  await page.getByText('Task', { exact: true }).first().click();
  await page.getByTestId('task-open-4').click();
  await page.getByPlaceholder(/Enter the tx hash/).fill('0xlocal-network-audit');
  await page.getByTestId('task-verify').click();
  await expect(page.getByText('Completed the task')).toBeVisible({ timeout: 5000 });
  await page.getByText('Close', { exact: true }).click();
  if (test.info().project.name === 'desktop') await page.keyboard.press('Escape');

  await page.getByText('Lucky', { exact: true }).first().click();
  for (let spin = 0; spin < 5; spin += 1) {
    await page.getByTestId('spin-pointer').click();
    await expect(page.getByText(/Congratulations on winning/)).toBeVisible({ timeout: 10000 });
    await page.getByText(/close/i, { exact: true }).first().click();
  }

  if (test.info().project.name === 'desktop') await page.keyboard.press('Escape');
  if (test.info().project.name === 'desktop') {
    await page.getByText('My', { exact: true }).click();
    await page.getByText('BP', { exact: true }).first().click();
    await page.getByTestId('box-501').click();
    await expect(page.getByText('+150')).toBeVisible({ timeout: 5000 });
  }

  expect(unexpectedRequests, `Unexpected non-local requests:\n${unexpectedRequests.join('\n')}`).toEqual([]);
  expect(failedResponses, `Unexpected failed local responses:\n${failedResponses.join('\n')}`).toEqual([]);
});
