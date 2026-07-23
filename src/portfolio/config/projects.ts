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
  {
    id: 'nftscan',
    name: 'NFTScan',
    description: 'A multi-chain NFT explorer and data infrastructure product for NFT indexing, analytics, marketplace data, and developer APIs.',
    cover: '/projects/portfolio/nftscan.png',
    href: 'https://www.nftscan.com/',
    status: 'available',
    tags: ['NFT Data', 'Explorer', 'API'],
    internal: false,
  },
  {
    id: 'nftscan-site',
    name: 'NFTScan Site',
    description: 'A project management and site service for NFT collections, marketplaces, and NFTFi teams, including verification and analytics workflows.',
    cover: '/projects/portfolio/nftscan-site.png',
    href: 'https://site.nftscan.com/',
    status: 'available',
    tags: ['SaaS', 'NFTFi', 'Analytics'],
    internal: false,
  },
  {
    id: 'mintchain',
    name: 'Mint Blockchain',
    description: 'An NFT-focused L2 blockchain for consumer NFT applications, developer tooling, infrastructure, and ecosystem programs.',
    cover: '/projects/portfolio/mintchain.png',
    href: 'https://www.mintchain.io/',
    status: 'available',
    tags: ['L2', 'NFT', 'Infrastructure'],
    internal: false,
  },
  {
    id: 'pengopay',
    name: 'PengoPay',
    description: 'A non-custodial stablecoin payment product for invoices, payment sites, KYT/AML checks, and fiat settlement workflows.',
    cover: '/projects/portfolio/pengopay.png',
    href: 'https://www.pengopay.com/',
    status: 'available',
    tags: ['Payments', 'Stablecoin', 'Compliance'],
    internal: false,
  },
  {
    id: '10xprotocol',
    name: '10XProtocol Alpha',
    description: 'A one-click crypto asset trading workspace focused on swap, bridge, and analysis flows.',
    cover: '/projects/portfolio/10xprotocol.png',
    href: 'https://www.10xprotocol.ai/alpha',
    status: 'available',
    tags: ['Trading', 'Swap', 'Bridge'],
    internal: false,
  },
];
