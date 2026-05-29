import { normalizeLocale } from '@/lib/i18n';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const zh = locale === 'zh';
  return (
    <main className="about-page">
      <section className="page-title-section">
        <div className="page-title-copy">
          <p>01 / {zh ? '关于' : 'About'}</p>
          <h1>{zh ? '关于我' : 'About'}</h1>
        </div>
        <p className="lead">
          {zh
            ? '不是简历页，而是说明这个博客为什么存在，以及我如何看待产品与工程。'
            : 'Not a resume page, but a note on why this blog exists and how I think about product and engineering.'}
        </p>
      </section>
      <section className="about-content">
        <div className="about-image" />
        <div className="about-text">
          <p>
            {zh
              ? '我关注的是把一个产品从想法推进到稳定上线的全过程：需求拆解、架构取舍、前端体验、数据结构、运维迁移，以及上线后的真实反馈。'
              : 'I focus on the full path from idea to stable launch: requirements, architecture, frontend experience, data, migration, and feedback.'}
          </p>
          <p>
            {zh
              ? '这个博客不是资讯流，而是一份持续更新的工作档案。每一篇文章都尽量回答一个具体问题：为什么这样做，边界在哪里，后续怎么复用。'
              : 'This blog is a working archive. Each post tries to answer why a decision was made, where its edges are, and how it can be reused.'}
          </p>
          <p>
            {zh
              ? '我喜欢克制的界面、清晰的系统边界，也喜欢把复杂事情写成别人能直接执行的清单。'
              : 'I like restrained interfaces, clear system boundaries, and turning complex work into executable checklists.'}
          </p>
        </div>
      </section>
    </main>
  );
}
