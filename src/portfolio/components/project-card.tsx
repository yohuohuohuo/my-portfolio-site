import type { PortfolioProject } from '../config/projects';
import PortfolioProjectLink from './portfolio-project-link';

interface ProjectCardProps {
  project: PortfolioProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article
      data-testid={`project-${project.id}`}
      className="flex min-w-0 flex-col overflow-hidden rounded-[8px] border border-[#32353e] bg-[#17191f] text-[#f3f1ec]"
    >
      <div className="aspect-[16/9] overflow-hidden bg-[#242731]">
        <img className="block h-full w-full object-cover" src={project.cover} alt={`${project.name} cover`} loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col gap-[16px] p-[20px]">
        <div className="flex items-start justify-between gap-[16px]">
          <h2 className="m-0 text-[18px] font-bold leading-[1.2] text-[#f5f3ed]">{project.name}</h2>
          <span className="shrink-0 text-[11px] font-bold uppercase leading-[1.2] text-[#aaa9a4]">{project.status}</span>
        </div>
        <p className="m-0 text-[14px] leading-[1.65] text-[#b9b8b3]">{project.description}</p>
        <div className="flex flex-wrap gap-[8px]" aria-label={`${project.name} technologies`}>
          {project.tags.map((tag) => (
            <span className="border border-[#3b3e47] px-[7px] py-[5px] text-[12px] leading-none text-[#ccc9c1]" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <PortfolioProjectLink project={project} variant="card" />
      </div>
    </article>
  );
}
