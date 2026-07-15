'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { projects, type PortfolioProject } from '../config/projects';
import styles from '../styles/portfolio.module.css';
import { getRandomProject } from '../utils/featured-project';
import PortfolioFeaturedLink from './portfolio-featured-link';

const PortfolioLanyard = dynamic(() => import('./portfolio-lanyard'), { ssr: false });

function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);

    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}

function FeaturedDetails({ project }: { project: PortfolioProject }) {
  return (
    <div className={styles.featuredDetails}>
      <p className={styles.eyebrow}>Selected project</p>
      <h2 className={styles.featuredTitle}>{project.name}</h2>
      <p className={styles.featuredDescription}>{project.description}</p>
      <div className={styles.featuredTags} aria-label={`${project.name} technologies`}>
        {project.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <PortfolioFeaturedLink project={project} />
    </div>
  );
}

export default function PortfolioFeatured() {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [readyProjectId, setReadyProjectId] = useState<string | null>(null);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const markLanyardReady = useCallback((projectId: string) => setReadyProjectId(projectId), []);

  useEffect(() => {
    setProject(getRandomProject(projects));
  }, []);

  const isReady = project !== null && isDesktop !== null && prefersReducedMotion !== null;

  return (
    <section className={styles.featured} data-testid="portfolio-featured" aria-label="Featured project">
      {!isReady ? <div className={styles.featuredLoading} aria-hidden="true" /> : null}
      {isReady && project && isDesktop && !prefersReducedMotion ? (
        <>
          <div
            className={styles.lanyardFrame}
            data-lanyard-ready={readyProjectId === project.id ? 'true' : undefined}
            data-lanyard-placement="right"
            data-testid="portfolio-lanyard"
          >
            <PortfolioLanyard cover={project.cover} name={project.name} projectId={project.id} onReady={markLanyardReady} />
          </div>
          <FeaturedDetails project={project} />
        </>
      ) : null}
      {isReady && project && (!isDesktop || prefersReducedMotion) ? (
        <div className={styles.mobileFeatured} data-testid="portfolio-mobile-featured">
          <div className={styles.mobileFeaturedMedia}>
            <img src={project.cover} alt={`${project.name} cover`} />
          </div>
          <FeaturedDetails project={project} />
        </div>
      ) : null}
    </section>
  );
}
