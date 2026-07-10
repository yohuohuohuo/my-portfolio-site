import { expect, test } from '@playwright/test';

test('portfolio lists Mint Forest without fabricated profile details and opens the project', async ({ page }) => {
  await page.goto('/');

  const project = page.getByTestId('project-mint-forest');
  await expect(project).toBeVisible();
  await expect(project.getByRole('heading', { name: 'Mint Forest' })).toBeVisible();
  await expect(page.getByText(/about me|biography|contact/i)).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);

  await project.getByRole('link', { name: /open mint forest/i }).click();

  await expect(page).toHaveURL(/\/mint-forest$/);
  await expect(page.locator('canvas').first()).toBeVisible();
});

test('Mint Forest is available as a direct page route', async ({ page }) => {
  await page.goto('/mint-forest');

  await expect(page.locator('canvas').first()).toBeVisible();
});
