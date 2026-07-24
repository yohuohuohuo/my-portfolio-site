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

test('portfolio projects use a static grid without Chroma hover effects', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The static grid interaction is covered by the desktop project.');

  await page.goto('/');

  const grid = page.locator('section[aria-label="Projects"]');
  const project = page.getByTestId('project-10xprotocol');
  const outboundLink = project.getByRole('link', { name: 'Visit 10XProtocol Alpha' });

  await expect(grid).toHaveCSS('display', 'grid');
  await expect(grid).toHaveClass(/(?:^|\s)grid(?:\s|$)/);
  await expect(grid).toHaveClass(/sm:grid-cols-2/);
  await expect(grid).toHaveClass(/lg:grid-cols-3/);
  await expect(project).toHaveClass(/(?:^|\s)flex(?:\s|$)/);
  await expect(grid).not.toHaveAttribute('data-chroma-enabled', 'true');
  await expect(grid.getByTestId('chroma-base-mask')).toHaveCount(0);

  await project.hover();
  await expect(project).not.toHaveAttribute('data-chroma-active', 'true');
  await expect(project).toHaveCSS('transition-duration', '0s');
  await expect(project.locator('img')).toHaveCSS('transition-duration', '0s');
  await expect(outboundLink).toHaveAttribute('data-specular-button', 'true');
});

test('portfolio project cards keep links usable without hover state', async ({ page }, testInfo) => {
  await page.goto('/');

  const project = page.getByTestId('project-10xprotocol');
  const outboundLink = project.getByRole('link', { name: 'Visit 10XProtocol Alpha' });

  await expect(outboundLink).toBeVisible();

  if (testInfo.project.name === 'desktop') {
    await project.hover();
    await expect(project).not.toHaveAttribute('data-chroma-active', 'true');
    return;
  }

  await expect(project).not.toHaveAttribute('data-chroma-active', 'true');
  await project.screenshot({ path: testInfo.outputPath('portfolio-chroma-mobile.png') });
});

test('portfolio CTA links use SpecularButton', async ({ page }) => {
  await page.goto('/');

  const featuredLink = page.getByTestId('portfolio-featured').locator('[data-specular-button="true"]');
  const projectLink = page.getByTestId('project-mint-forest').locator('[data-specular-button="true"]');

  await expect(featuredLink).toHaveCount(1);
  await expect(featuredLink.locator('canvas')).toHaveCount(1);
  await expect(projectLink).toHaveCount(1);
  await expect(projectLink.locator('canvas')).toHaveCount(1);

  const projectButtonTint = await projectLink.evaluate((element) => element.style.getPropertyValue('--sb-tint').trim());

  expect(projectButtonTint).toBe('#f1ede3');

  const overlayInset = await featuredLink.evaluate((element) => {
    const buttonRect = element.getBoundingClientRect();
    const overlayRect = element.querySelector('span[aria-hidden="true"]')?.getBoundingClientRect();

    if (!overlayRect) {
      return null;
    }

    return {
      left: buttonRect.left - overlayRect.left,
      top: buttonRect.top - overlayRect.top,
    };
  });

  expect(overlayInset?.left).toBeCloseTo(20, 0);
  expect(overlayInset?.top).toBeCloseTo(20, 0);
});

test('Mint Forest is available as a direct page route', async ({ page }) => {
  await page.goto('/mint-forest');

  await expect(page.locator('canvas').first()).toBeVisible();
});
