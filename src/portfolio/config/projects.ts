export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  cover: string;
  href: string;
  status: 'available' | 'planned';
  tags: string[];
  internal: boolean;
}

export const projects: PortfolioProject[] = [
  {
    id: 'mint-forest',
    name: 'Mint Forest',
    description: 'An interactive forest experience preserved as a local, deterministic demo.',
    cover: '/projects/mint-forest/images/og-img.jpg',
    href: '/mint-forest',
    status: 'available',
    tags: ['Next.js', 'React', 'Two.js'],
    internal: true,
  },
];
