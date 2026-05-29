import { Locale, pickI18n, pickI18nArray } from './i18n.js';

export type ProjectRow = {
  id: number;
  slug: string;
  title_i18n: unknown;
  summary_i18n: unknown;
  description_i18n: unknown;
  cover_url: string | null;
  project_url: string | null;
  repo_url: string | null;
  role_i18n: unknown;
  tags_i18n: unknown;
  is_featured: number;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PostRow = {
  id: number;
  slug: string;
  title_i18n: unknown;
  summary_i18n: unknown;
  content_i18n: unknown;
  cover_url: string | null;
  tags_i18n: unknown;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function serializeProject(row: ProjectRow, locale: Locale) {
  return {
    id: row.id,
    slug: row.slug,
    title: pickI18n(row.title_i18n, locale),
    summary: pickI18n(row.summary_i18n, locale),
    description: pickI18n(row.description_i18n, locale),
    coverUrl: row.cover_url,
    projectUrl: row.project_url,
    repoUrl: row.repo_url,
    role: pickI18n(row.role_i18n, locale),
    tags: pickI18nArray(row.tags_i18n, locale),
    isFeatured: Boolean(row.is_featured),
    sortOrder: row.sort_order,
    status: row.status
  };
}

export function serializePost(row: PostRow, locale: Locale, includeContent = false) {
  return {
    id: row.id,
    slug: row.slug,
    title: pickI18n(row.title_i18n, locale),
    summary: pickI18n(row.summary_i18n, locale),
    content: includeContent ? pickI18n(row.content_i18n, locale) : undefined,
    coverUrl: row.cover_url,
    tags: pickI18nArray(row.tags_i18n, locale),
    status: row.status,
    publishedAt: row.published_at
  };
}
