import { apiLocale, Locale } from './i18n';

const API_BASE = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export type Project = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  projectUrl?: string | null;
  repoUrl?: string | null;
  role?: string;
  tags: string[];
  isFeatured: boolean;
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content?: string;
  tags: string[];
  publishedAt?: string | null;
};

async function fetchJson<T>(path: string, locale: Locale, init?: RequestInit): Promise<T> {
  const separator = path.includes('?') ? '&' : '?';
  const res = await fetch(`${API_BASE}${path}${separator}locale=${apiLocale(locale)}`, {
    next: { revalidate: 60 },
    ...init
  });
  if (!res.ok) throw new Error(`API request failed: ${path}`);
  return res.json();
}

export function getSite(locale: Locale) {
  return fetchJson<{ hero: { title: string; subtitle: string }; projects: Project[]; posts: Post[] }>('/api/site', locale);
}

export function getProjects(locale: Locale) {
  return fetchJson<Project[]>('/api/projects', locale);
}

export function getProject(locale: Locale, slug: string) {
  return fetchJson<Project>(`/api/projects/${slug}`, locale);
}

export function getPosts(locale: Locale) {
  return fetchJson<Post[]>('/api/posts', locale);
}

export function getPost(locale: Locale, slug: string) {
  return fetchJson<Post>(`/api/posts/${slug}`, locale);
}
