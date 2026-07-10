import Link from 'next/link';
import type { PortfolioProject } from '../config/projects';

interface ProjectCardProps {
  project: PortfolioProject;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article data-testid={`project-${project.id}`} className="group overflow-hidden rounded-md border border-[#dfe3e8] bg-white shadow-sm">
      <div className="aspect-[16/9] overflow-hidden bg-[#edf0f2]">
        <img
          src={project.cover}
          alt={`${project.name} cover`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#1d242c]">{project.name}</h2>
          <span className="shrink-0 text-xs uppercase tracking-[0.08em] text-[#66717d]">{project.status}</span>
        </div>
        <p className="m-0 text-sm leading-6 text-[#596571]">{project.description}</p>
        <div className="flex flex-wrap gap-2" aria-label={`${project.name} technologies`}>
          {project.tags.map((tag) => (
            <span key={tag} className="rounded border border-[#dfe3e8] px-2 py-1 text-xs text-[#66717d]">
              {tag}
            </span>
          ))}
        </div>
        <Link
          href={project.href}
          className="mt-1 inline-flex w-fit items-center rounded border border-[#1d242c] px-3 py-2 text-sm font-medium text-[#1d242c] transition-colors hover:bg-[#1d242c] hover:text-white"
          aria-label={`Open ${project.name}`}
        >
          Open {project.name}
        </Link>
      </div>
    </article>
  );
}
