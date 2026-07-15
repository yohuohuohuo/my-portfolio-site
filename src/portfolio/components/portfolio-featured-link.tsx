import Link from 'next/link';
import type { PortfolioProject } from '../config/projects';
import styles from '../styles/portfolio.module.css';

interface PortfolioFeaturedLinkProps {
  project: PortfolioProject;
}

export default function PortfolioFeaturedLink({ project }: PortfolioFeaturedLinkProps) {
  const label = project.internal ? `Open ${project.name}` : `Visit ${project.name}`;

  if (project.internal) {
    return (
      <Link href={project.href} className={styles.featuredLink} aria-label={label}>
        {label}
      </Link>
    );
  }

  return (
    <a href={project.href} target="_blank" rel="noopener noreferrer" className={styles.featuredLink} aria-label={label}>
      {label}
    </a>
  );
}
