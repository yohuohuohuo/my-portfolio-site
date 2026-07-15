import { describe, expect, it } from 'vitest';
import { projects } from '../../src/portfolio/config/projects';
import { getRandomProject } from '../../src/portfolio/utils/featured-project';

describe('portfolio featured project selection', () => {
  it('selects the first and final project at the random range boundaries', () => {
    expect(getRandomProject(projects, () => 0)).toBe(projects[0]);
    expect(getRandomProject(projects, () => 0.999999)).toBe(projects.at(-1));
  });
});
