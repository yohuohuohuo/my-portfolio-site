import { projects } from '../config/projects';
import ChromaProjectGrid from './chroma-project-grid';
import ProjectCard from './project-card';
import PortfolioFeatured from './portfolio-featured';
import styles from '../styles/portfolio.module.css';

export default function PortfolioPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Projects</p>
          <h1 className={styles.pageTitle}>Personal Portfolio</h1>
          <p className={styles.pageDescription}>A small collection of interactive work.</p>
        </header>
        <PortfolioFeatured />
        <ChromaProjectGrid>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} chromaIndex={index} project={project} />
          ))}
        </ChromaProjectGrid>
      </div>
    </main>
  );
}
