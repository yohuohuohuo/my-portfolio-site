import type { ReactNode } from 'react';

interface ProjectGridProps {
  children: ReactNode;
}

export default function ProjectGrid({ children }: ProjectGridProps) {
  return (
    <section aria-label="Projects" className="grid gap-[24px] sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </section>
  );
}
