import { projects } from '../config/projects';
import ProjectCard from './project-card';
import styles from '../styles/portfolio.module.css';

export default function PortfolioPage() {
  return (
    <main className={`${styles.page} text-[#1d242c]`}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:px-10">
        <header className="max-w-2xl">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#66717d]">Projects</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Personal Portfolio</h1>
          <p className="mt-4 text-base leading-7 text-[#596571]">A small collection of interactive work.</p>
        </header>
        <section aria-label="Projects" className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      </div>
    </main>
  );
}
