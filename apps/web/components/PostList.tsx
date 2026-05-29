import Link from 'next/link';
import { Locale } from '@/lib/i18n';
import type { Post } from '@/lib/api';

export function PostList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  return (
    <div className="post-list">
      {posts.map((post) => (
        <Link className="post-row" href={`/${locale}/posts/${post.slug}`} key={post.slug}>
          <div className="post-text">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-tag">{post.tags[0] || post.summary}</p>
          </div>
          <span className="post-date">{post.publishedAt?.slice(0, 7).replace('-', '年')}月</span>
        </Link>
      ))}
    </div>
  );
}
