import { getProjects } from '@/lib/api';
import { dict, normalizeLocale } from '@/lib/i18n';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const projects = await getProjects(locale);
  const t = dict[locale];
  const archiveProjects = [
    ...projects.slice(1, 5),
    {
      id: 0,
      slug: 'course-payment-flow',
      title: locale === 'zh' ? '课程支付链路' : 'Course Payment Flow',
      summary: locale === 'zh' ? '补齐课程订单、支付状态、权限开通和后台核验流程。' : 'Course order, payment state, access activation, and admin verification.',
      description: '',
      tags: [],
      role: locale === 'zh' ? '支付流程 / 权限' : 'Payment / Access',
      isFeatured: false
    }
  ].slice(0, 4);

  return (
    <main className="archive-page">
      <section className="page-title-section archive-title">
        <div className="page-title-copy">
          <p>02 / {t.projects}</p>
          <h1>{t.projectArchive}</h1>
        </div>
        <p className="lead">
          {locale === 'zh'
            ? '每个项目都保留目标、关键工作和复盘，方便后续继续生长。'
            : 'Each project keeps its goal, key work, and notes for future growth.'}
        </p>
      </section>

      <section className="project-feature">
        <div className="project-feature-copy">
          <div className="tag-row">
            <span>主项目</span>
            <span>开源项目</span>
            <span>全链路实现</span>
          </div>
          <h2>{projects[0]?.title || '恩特学术'}</h2>
          <p>{projects[0]?.summary}</p>
          <div className="feature-columns">
            <div><strong>前台</strong><span>内容展示</span></div>
            <div><strong>后台</strong><span>运营管理</span></div>
            <div><strong>中间件</strong><span>上下游同步</span></div>
          </div>
        </div>
        <div className="project-feature-visual">
          <div className="browser-card" />
          <div className="flow-line" />
          <span>enterscholar.com</span>
        </div>
      </section>

      <section className="project-archive-grid">
        {archiveProjects.map((project) => (
          <a className="archive-card" href={`/${locale}/projects/${project.slug}`} key={project.slug}>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <span>{project.role || project.tags.join(' / ')}</span>
          </a>
        ))}
        <div className="archive-note">
          <span>后续项目可继续追加到这里</span>
          <span>保持同一套项目卡片结构</span>
        </div>
      </section>
    </main>
  );
}
