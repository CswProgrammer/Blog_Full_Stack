import { getProject } from '@/lib/api';
import { normalizeLocale } from '@/lib/i18n';

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const project = await getProject(locale, slug);

  return (
    <main className="detail-page">
      <section className="detail-head">
        <p>{locale === 'zh' ? '项目详情' : 'Project Detail'}</p>
        <h1 className="detail-title">{project.title}</h1>
        <p className="lead">{project.summary}</p>
      </section>
      <article className="detail-table">
        <div><strong>目标</strong><p>{project.description}</p></div>
        <div><strong>关键工作</strong><p>{project.role || '梳理边界、补齐链路、保留可观测入口。'}</p></div>
        <div><strong>结果</strong><p>页面结构更清楚，流程可以复用，后续模块可以按同一套检查清单推进。</p></div>
      </article>
    </main>
  );
}
