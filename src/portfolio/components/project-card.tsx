'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import type { PortfolioProject } from '../config/projects';
import styles from '../styles/chroma-project-card.module.css';

interface ProjectCardProps {
  chromaIndex: number;
  project: PortfolioProject;
}

const CARD_HUES = [142, 191, 337, 38, 273, 208];

function useFinePointer(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);

    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  return enabled;
}

export default function ProjectCard({ chromaIndex, project }: ProjectCardProps) {
  const canUseChroma = useFinePointer();
  const [isChromaActive, setChromaActive] = useState(false);
  const linkLabel = project.internal ? `Open ${project.name}` : `Visit ${project.name}`;
  const cardStyle = { '--card-hue': CARD_HUES[chromaIndex % CARD_HUES.length] } as CSSProperties;

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    if (!canUseChroma) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mouse-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--mouse-y', `${event.clientY - bounds.top}px`);
  };

  return (
    <article
      data-chroma-active={isChromaActive ? 'true' : undefined}
      data-testid={`project-${project.id}`}
      className={styles.card}
      onMouseMove={handleMouseMove}
      onPointerEnter={() => canUseChroma && setChromaActive(true)}
      onPointerLeave={() => setChromaActive(false)}
      style={cardStyle}
    >
      <div className={styles.media}>
        <img src={project.cover} alt={`${project.name} cover`} loading="lazy" />
      </div>
      <div className={styles.content}>
        <div className={styles.heading}>
          <h2>{project.name}</h2>
          <span className={styles.status}>{project.status}</span>
        </div>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.tags} aria-label={`${project.name} technologies`}>
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {project.internal ? (
          <Link href={project.href} className={styles.link} aria-label={linkLabel}>
            {linkLabel}
          </Link>
        ) : (
          <a href={project.href} target="_blank" rel="noopener noreferrer" className={styles.link} aria-label={linkLabel}>
            {linkLabel}
          </a>
        )}
      </div>
    </article>
  );
}
