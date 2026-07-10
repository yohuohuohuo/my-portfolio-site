import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/mint-forest');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('enters the local demo, restores it after reload, and logs out without losing business state', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Enter Demo' })).toBeVisible();
  await page.getByPlaceholder('Invite Code').fill('FOREST-DEMO');
  await page.getByRole('button', { name: 'Enter Demo' }).click();
  await expect(page.getByText('Demo ID 1001')).toBeVisible();

  await page.reload();
  await expect(page.getByText('Demo ID 1001')).toBeVisible();

  await page.getByText('Demo ID 1001').click();
  await page.getByText('Log Out').click();
  await expect(page.getByRole('button', { name: 'Enter Demo' })).toBeVisible();

  await page.getByPlaceholder('Invite Code').fill('FOREST-DEMO');
  await page.getByRole('button', { name: 'Enter Demo' }).click();
  await expect(page.getByText('Demo ID 1001')).toBeVisible();
});
