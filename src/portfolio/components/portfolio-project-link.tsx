import type { PortfolioProject } from '../config/projects';
import SpecularButton from './specular-button';

interface PortfolioProjectLinkProps {
  project: PortfolioProject;
  variant?: 'featured' | 'card';
}

export default function PortfolioProjectLink({ project, variant = 'featured' }: PortfolioProjectLinkProps) {
  const label = project.internal ? `Open ${project.name}` : `Visit ${project.name}`;
  const isFeatured = variant === 'featured';

  return (
    <SpecularButton
      href={project.href}
      external={!project.internal}
      ariaLabel={label}
      radius={isFeatured ? 8 : 6}
      tint="#f1ede3"
      tintOpacity={isFeatured ? 0.08 : 0.06}
      blur={isFeatured ? 10 : 8}
      textColor={isFeatured ? '#f1ede3' : '#f4f1ea'}
      lineColor="#f1ede3"
      baseColor={isFeatured ? '#6b6d70' : '#555862'}
      intensity={1.2}
      shineSize={18}
      shineFade={34}
      thickness={1.1}
      proximity={260}
      className={isFeatured ? 'mt-[24px]' : 'mt-auto'}
    >
      {label}
    </SpecularButton>
  );
}
