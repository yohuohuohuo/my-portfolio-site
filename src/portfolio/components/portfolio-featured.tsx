'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { projects, type PortfolioProject } from '../config/projects';
import { getRandomProject } from '../utils/featured-project';
import PortfolioEyebrow from './portfolio-eyebrow';
import PortfolioProjectLink from './portfolio-project-link';

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

function FeaturedDetails({ project, mobile = false }: { project: PortfolioProject; mobile?: boolean }) {
  return (
    <div
      className={
        mobile
          ? 'pointer-events-none m-0 flex min-h-0 w-auto flex-col justify-end px-[24px] pb-[32px] pt-[28px] [&>*]:pointer-events-auto'
          : 'pointer-events-none relative z-[1] ml-[24px] flex min-h-[540px] w-[calc(100%-48px)] max-w-[430px] flex-col justify-end py-[40px] md:ml-[48px] [&>*]:pointer-events-auto'
      }
    >
      <PortfolioEyebrow>Selected project</PortfolioEyebrow>
      <h2 className="m-[10px_0_0] text-[clamp(30px,4vw,48px)] font-bold leading-none text-[#f7f5ef]">{project.name}</h2>
      <p className="mt-[16px] max-w-[400px] text-[16px] leading-[1.65] text-[#b8b7b2]">{project.description}</p>
      <div className="mt-[20px] flex flex-wrap gap-[8px]" aria-label={`${project.name} technologies`}>
        {project.tags.map((tag) => (
          <span className="border border-[#55575f] px-[8px] py-[5px] text-[12px] leading-none text-[#ddd9d0]" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <PortfolioProjectLink project={project} />
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
    <section
      className="relative min-h-[540px] overflow-hidden rounded-xl border border-[#2f3138] bg-[#111319]"
      data-testid="portfolio-featured"
      aria-label="Featured project"
    >
      {!isReady ? <div className="absolute inset-0 bg-[#111319]" aria-hidden="true" /> : null}
      {isReady && project && isDesktop && !prefersReducedMotion ? (
        <>
          <div
            className="absolute inset-0"
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
        <div className="grid min-h-0 grid-cols-1" data-testid="portfolio-mobile-featured">
          <div className="aspect-[16/9] overflow-hidden bg-[#20222a]">
            <img className="block h-full w-full object-cover" src={project.cover} alt={`${project.name} cover`} />
          </div>
          <FeaturedDetails project={project} mobile />
        </div>
      ) : null}
    </section>
  );
}
