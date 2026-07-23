import type { PortfolioProject } from '../config/projects';

export function getRandomProject(
  items: readonly PortfolioProject[],
  random: () => number = Math.random,
): PortfolioProject {
  if (items.length === 0) {
    throw new Error('Cannot select a featured project from an empty collection.');
  }

  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}
