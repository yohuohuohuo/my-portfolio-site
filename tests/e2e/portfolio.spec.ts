import { expect, test } from '@playwright/test';

test('portfolio lists Mint Forest without fabricated profile details and opens the project', async ({ page }) => {
  await page.goto('/');

  const project = page.getByTestId('project-mint-forest');
  await expect(project).toBeVisible();
  await expect(project.getByRole('heading', { name: 'Mint Forest' })).toBeVisible();
  await expect(page.getByText(/about me|biography|contact/i)).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);

  await project.getByRole('link', { name: /open mint forest/i }).click();

  await expect(page).toHaveURL(/\/mint-forest$/, { timeout: 15_000 });
  await expect(page.locator('canvas').first()).toBeVisible();
});

test('portfolio lists external projects as outbound links', async ({ page }) => {
  await page.goto('/');

  const expectedProjects = [
    ['project-nftscan', 'NFTScan', 'https://www.nftscan.com/'],
    ['project-nftscan-site', 'NFTScan Site', 'https://site.nftscan.com/'],
    ['project-mintchain', 'Mint Blockchain', 'https://www.mintchain.io/'],
    ['project-pengopay', 'PengoPay', 'https://www.pengopay.com/'],
    ['project-10xprotocol', '10XProtocol Alpha', 'https://www.10xprotocol.ai/alpha'],
  ] as const;

  for (const [testId, name, href] of expectedProjects) {
    const project = page.getByTestId(testId);
    await expect(project.getByRole('heading', { name })).toBeVisible();

    const link = project.getByRole('link', { name: `Visit ${name}` });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }

  await expect(page.getByTestId('project-10xprotocol').getByRole('img', { name: '10XProtocol Alpha cover' })).toHaveAttribute(
    'src',
    '/projects/portfolio/10xprotocol.png',
  );
});

test('portfolio shows a desktop lanyard and a static mobile featured project', async ({ page }, testInfo) => {
  await page.goto('/');

  await expect(page.getByTestId('portfolio-featured')).toBeVisible();

  if (testInfo.project.name === 'desktop') {
    const lanyard = page.getByTestId('portfolio-lanyard');
    const canvas = lanyard.locator('canvas');
    await expect(lanyard).toBeVisible();
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('data-engine', /three\.js/);
    await expect(lanyard).toHaveAttribute('data-lanyard-placement', 'right');
    await expect(lanyard).toHaveAttribute('data-lanyard-ready', 'true');

    const canvasChannelRange = await canvas.evaluate((element) => {
      const source = element as HTMLCanvasElement;
      const sample = document.createElement('canvas');
      sample.width = 64;
      sample.height = 64;
      const context = sample.getContext('2d', { willReadFrequently: true });

      if (!context) {
        return 0;
      }

      context.drawImage(source, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      let minimum = 255;
      let maximum = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        minimum = Math.min(minimum, pixels[index], pixels[index + 1], pixels[index + 2]);
        maximum = Math.max(maximum, pixels[index], pixels[index + 1], pixels[index + 2]);
      }

      return maximum - minimum;
    });

    expect(canvasChannelRange).toBeGreaterThan(24);
    await lanyard.screenshot({ path: testInfo.outputPath('portfolio-lanyard-desktop.png') });
    await expect(page.getByTestId('portfolio-mobile-featured')).toHaveCount(0);
    return;
  }

  const mobileFeatured = page.getByTestId('portfolio-mobile-featured');
  await expect(mobileFeatured).toBeVisible();
  await mobileFeatured.screenshot({ path: testInfo.outputPath('portfolio-lanyard-mobile.png') });
  await expect(page.getByTestId('portfolio-lanyard')).toHaveCount(0);
});

test('desktop portfolio softens the featured frame and preserves muted Chroma color at rest', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The Chroma baseline mask is only rendered for desktop fine pointers.');

  await page.goto('/');

  await expect(page.getByTestId('portfolio-featured')).toHaveCSS('border-top-left-radius', '12px');

  const chromaBaseMask = page.getByTestId('chroma-base-mask');
  await expect(chromaBaseMask).toBeVisible();
  await expect(chromaBaseMask).toHaveCSS('backdrop-filter', 'grayscale(0.42) saturate(0.72) brightness(0.78)');
});

test('portfolio project cards expose Chroma hover state without affecting mobile links', async ({ page }, testInfo) => {
  await page.goto('/');

  const project = page.getByTestId('project-10xprotocol');
  const outboundLink = project.getByRole('link', { name: 'Visit 10XProtocol Alpha' });

  await expect(outboundLink).toBeVisible();

  if (testInfo.project.name === 'desktop') {
    await project.hover();
    await expect(project).toHaveAttribute('data-chroma-active', 'true');
    await page.waitForTimeout(600);
    await page.screenshot({ path: testInfo.outputPath('portfolio-chroma-desktop.png') });
    return;
  }

  await expect(project).not.toHaveAttribute('data-chroma-active', 'true');
  await project.screenshot({ path: testInfo.outputPath('portfolio-chroma-mobile.png') });
});

test('Mint Forest is available as a direct page route', async ({ page }) => {
  await page.goto('/mint-forest');

  await expect(page.locator('canvas').first()).toBeVisible();
});
