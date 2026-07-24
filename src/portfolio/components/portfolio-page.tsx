import { projects } from '../config/projects';
import ProjectGrid from './project-grid';
import ProjectCard from './project-card';
import PortfolioFeatured from './portfolio-featured';
import PortfolioEyebrow from './portfolio-eyebrow';

export default function PortfolioPage() {
  return (
    <main className="min-h-[100dvh] bg-[#090a0d] text-[#f2f0ea]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1200px] flex-col gap-[40px] px-[24px] pb-[64px] pt-[48px] sm:px-[40px] md:pt-[64px]">
        <header className="max-w-[560px]">
          <PortfolioEyebrow>Projects</PortfolioEyebrow>
          <h1 className="m-[10px_0_0] text-[clamp(32px,5vw,54px)] font-bold leading-none text-[#f7f5ef]">Personal Portfolio</h1>
          <p className="mt-[16px] text-[16px] leading-[1.65] text-[#b8b7b2]">A small collection of interactive work.</p>
        </header>
        <PortfolioFeatured />
        <ProjectGrid>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ProjectGrid>
      </div>
    </main>
  );
}
