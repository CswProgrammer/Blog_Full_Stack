import Link from 'next/link';
import { ProjectCards } from '@/components/ProjectCards';
import { PostList } from '@/components/PostList';
import { getSite } from '@/lib/api';
import { dict, normalizeLocale } from '@/lib/i18n';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const t = dict[locale];
  const site = await getSite(locale);
  const homePosts = [
    ...site.posts.sort((a, b) => (a.slug === 'server-migration-runbook' ? -1 : b.slug === 'server-migration-runbook' ? 1 : 0)),
    {
      id: 0,
      slug: 'frontend-information-density',
      title: locale === 'zh' ? '前端页面为什么要先解决信息密度' : 'Why frontend pages need information density first',
      summary: '',
      tags: [locale === 'zh' ? '产品设计' : 'Product Design'],
      publishedAt: '2026-04-01'
    }
  ].slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-label">
          <Link href={`/${locale}/posts`}>{locale === 'zh' ? '博客' : 'Blog'}</Link>
          <span>/</span>
          <Link href={`/${locale}/projects`}>{locale === 'zh' ? '项目' : 'Projects'}</Link>
        </div>
        <div className="hero-copy">
          <p className="lead">{site.hero.subtitle}</p>
          <h1 className="display">{site.hero.title.replace('边做边写', '边做\n边写')}</h1>
        </div>
      </section>

      <section className="intro-grid">
        <p className="intro-label">01 / {t.about}</p>
        <p className="intro-body">
          {locale === 'zh'
            ? '我是一个偏工程实践的创作者，喜欢把复杂系统拆到可理解、可落地。这个博客用来沉淀项目复盘、技术笔记、产品判断，以及那些从踩坑里长出来的经验。'
            : 'I write from engineering practice, turning complex systems into understandable, shippable work.'}
        </p>
        <div className="intro-action">
          <span>{locale === 'zh' ? '常驻中国' : 'China based'}</span>
          <Link href={`/${locale}/contact`}>{locale === 'zh' ? '联系我' : 'Contact'}</Link>
        </div>
      </section>

      <section className="statement-section">
        <h2>{locale === 'zh' ? '想清楚。\n稳稳发布。' : 'Think clearly.\nShip steadily.'}</h2>
      </section>

      <section className="projects-band">
        <div className="section-head">
          <h2 className="section-title">{locale === 'zh' ? '精选项目' : 'Selected Projects'}</h2>
          <span>02 / {t.projects}</span>
        </div>
        <ProjectCards projects={site.projects} locale={locale} />
      </section>

      <section className="writing-section">
        <p className="writing-label">03 / {t.posts}</p>
        <PostList posts={homePosts} locale={locale} />
      </section>

      <section className="stack-section">
        <h2>{locale === 'zh' ? '技术栈与方向' : 'Stack and Direction'}</h2>
        <div className="stack-tags">
          {(locale === 'zh'
            ? ['前端框架', '界面开发', '后端语言', '服务框架', '关系数据库', '容器部署', '支付链路', '系统迁移', '管理端体验', '技术写作']
            : ['Frontend', 'Interface', 'Backend', 'Service', 'Database', 'Docker', 'Payments', 'Migration', 'Admin UX', 'Writing']
          ).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </>
  );
}
