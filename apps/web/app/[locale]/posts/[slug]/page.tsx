import { getPost } from '@/lib/api';
import { normalizeLocale } from '@/lib/i18n';

export default async function PostDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  const locale = normalizeLocale(rawLocale);
  const post = await getPost(locale, slug);

  return (
    <main className="detail-page">
      <section className="detail-head">
        <p>{locale === 'zh' ? '文章详情' : 'Post Detail'}</p>
        <h1 className="detail-title">{post.title}</h1>
        <p className="lead">{post.summary}</p>
      </section>
      <article className="post-detail-body">
        <aside>
          <span>{post.publishedAt?.slice(0, 7).replace('-', '年')}月</span>
          <span>{post.tags[0]}</span>
          <span>8 分钟阅读</span>
        </aside>
        <div>
        {post.content?.split('\n').map((paragraph, index) =>
          paragraph.trim() ? <p key={index}>{paragraph}</p> : null
        )}
        </div>
      </article>
    </main>
  );
}
