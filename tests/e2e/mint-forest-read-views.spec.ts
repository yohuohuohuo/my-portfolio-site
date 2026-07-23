import { expect, test } from '@playwright/test';

async function enterDemo(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Enter Demo' }).click();
  await expect(page.getByText('Demo ID 1001')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/mint-forest');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('searches a local Forest ID and opens the other forest route', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile', 'Desktop owns the full-size Forest search box.');
  await enterDemo(page);

  const search = page.getByPlaceholder('Search Forest ID').first();
  await search.fill('2001');
  const result = page.getByTestId('search-result-2001');
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/mint-forest\?id=2001/);
  await expect(page.getByTestId('other-forest-header')).toBeVisible();
});

test('opens local task, leaderboard, invite, backpack, news and lucky views', async ({ page }) => {
  await enterDemo(page);

  for (const menu of ['Task', 'LB', 'Lucky']) {
    await page.getByText(menu, { exact: true }).first().click();
    if (test.info().project.name === 'desktop') {
      await expect(page.locator('.ReactModal__Content').first()).toBeVisible();
      await page.keyboard.press('Escape');
    } else {
      await page.reload();
      await expect(page.getByText('Demo ID 1001')).toBeVisible();
    }
    await page.waitForTimeout(400);
  }

  for (const menu of ['Invite', 'BP', 'News']) {
    if (test.info().project.name === 'desktop') {
      await page.getByText('My', { exact: true }).click();
    }
    await page.getByText(menu, { exact: true }).first().click();
    if (test.info().project.name === 'desktop') {
      await expect(page.locator('.ReactModal__Content').first()).toBeVisible();
      await page.keyboard.press('Escape');
    } else {
      await page.reload();
      await expect(page.getByText('Demo ID 1001')).toBeVisible();
    }
    await page.waitForTimeout(400);
  }
});
