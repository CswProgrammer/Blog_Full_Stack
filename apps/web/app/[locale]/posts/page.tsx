import { PostList } from '@/components/PostList';
import { getPosts } from '@/lib/api';
import { dict, normalizeLocale } from '@/lib/i18n';

export default async function PostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const posts = await getPosts(locale);
  const t = dict[locale];
  const displayPosts = [
    ...posts,
    {
      id: 0,
      slug: 'frontend-information-density',
      title: locale === 'zh' ? '前端页面为什么要先解决信息密度' : 'Why frontend pages need information density first',
      summary: '',
      tags: [locale === 'zh' ? '产品设计' : 'Product Design'],
      publishedAt: '2026-04-01'
    },
    {
      id: -1,
      slug: 'feedback-loop-rebuild',
      title: locale === 'zh' ? '从反馈表开始重建用户处理闭环' : 'Rebuilding user handling loops from feedback forms',
      summary: '',
      tags: [locale === 'zh' ? '产品运营' : 'Product Ops'],
      publishedAt: '2026-04-01'
    }
  ].slice(0, 4);

  return (
    <main className="posts-page">
      <section className="page-title-section archive-title">
        <div className="page-title-copy">
          <p>03 / {t.posts}</p>
          <h1>{t.writing}</h1>
        </div>
        <p className="lead">
          {locale === 'zh'
            ? '围绕具体问题写作，记录能被复用的判断、流程和方法。'
            : 'Writing around concrete problems, reusable decisions, processes, and methods.'}
        </p>
      </section>
      <section className="posts-archive-list">
        <PostList posts={displayPosts} locale={locale} />
      </section>
    </main>
  );
}
