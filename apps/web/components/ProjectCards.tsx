import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import type { Project } from '@/lib/api';

export function ProjectCards({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const visible = projects.slice(0, 3);

  return (
    <div className="project-grid">
      {visible.map((project) => (
        <Link className="project-card" href={`/${locale}/projects/${project.slug}`} key={project.slug}>
          <div className="project-card-top">
            <h3 className="project-title">{project.title}</h3>
            <p>{project.summary}</p>
          </div>
          <p className="project-meta">{project.role || project.tags.join(' / ')}</p>
        </Link>
      ))}
    </div>
  );
}
