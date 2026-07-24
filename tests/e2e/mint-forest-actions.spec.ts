import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/mint-forest');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Enter Demo' }).click();
  await expect(page.getByText('Demo ID 1001')).toBeVisible();
});

test('performs local GreenID, reward, box and spin actions with reload persistence', async ({ page }) => {
  test.setTimeout(60000);

  await page.getByAltText('green id box').click();
  await page.getByRole('button', { name: 'Activate it' }).click();
  await expect(page.getByText('GreenID Boost: 0.0%')).toBeVisible({ timeout: 10000 });
  await page.getByTestId('green-id-close').click();

  await page.getByTestId('bubble-daily').click({ force: true });
  await page.waitForTimeout(300);
  await expect(page.getByTestId('mf-balance')).toContainText('2,520', { timeout: 5000 });
  await page.reload();
  await expect(page.getByTestId('mf-balance')).toContainText('2,520', { timeout: 10000 });

  if (test.info().project.name === 'desktop') await page.getByText('My', { exact: true }).click();
  await page.getByText('BP', { exact: true }).first().click();

  for (const [boxNumber, name, imagePath] of [
    ['501', 'Demo Mystery Box', '/projects/mint-forest/images/pic-signin-box.png'],
    ['502', 'Demo Event Box', '/projects/mint-forest/images/pix-event-box.png'],
  ] as const) {
    const image = page.getByTestId(`box-${boxNumber}`).getByAltText(name);
    await expect(image).toHaveAttribute('src', imagePath);
    await expect(
      image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)
    ).resolves.toBe(true);
  }

  await page.getByTestId('box-501').click();
  await expect(page.getByText('+150')).toBeVisible({ timeout: 5000 });
  await page.reload();
  await expect(page.getByText('Demo ID 1001')).toBeVisible({ timeout: 10000 });

  await page.getByText('Lucky', { exact: true }).first().click();
  await page.getByTestId('spin-pointer').click();
  await expect(page.getByText('Congratulations on winning 50 MF')).toBeVisible({ timeout: 10000 });
});
