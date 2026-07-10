import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/mint-forest');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Enter Demo' }).click();
  await expect(page.getByText('Demo ID 1001')).toBeVisible();
});

test('verifies Bridge locally and moves the task into Completed without OAuth', async ({ page }) => {
  await page.getByText('Task', { exact: true }).first().click();
  await expect(page.getByTestId('task-open-4')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('task-open-4').click();

  const input = page.getByPlaceholder(/Enter the tx hash/);
  await expect(input).toBeVisible();
  await page.getByTestId('task-verify').click();
  await expect(page.getByText('Please enter a valid input')).toBeVisible();

  await input.fill('0xlocal-demo-hash');
  await page.getByTestId('task-verify').click();
  await expect(page.getByText('Completed the task')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('+100 MF')).toBeVisible();
  await page.getByText('Close', { exact: true }).click();
  await expect(page.getByText('General Tasks')).toBeVisible();
  await page.getByText('Completed', { exact: true }).click();
  await expect(page.getByText('Bridge to Mint')).toBeVisible();
});

test('verifies Discord with the local code and never navigates to OAuth', async ({ page }) => {
  await page.getByText('Task', { exact: true }).first().click();
  await expect(page.getByTestId('task-open-3')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('task-open-3').click();
  await page.locator('[data-testid="task-verify-discord"]:visible').first().click();

  await expect(page.getByText('Completed the task')).toBeVisible({ timeout: 5000 });
  await expect(page).toHaveURL(/\/mint-forest$/);
  await expect(page.locator('body')).not.toContainText('discord.com');
});
