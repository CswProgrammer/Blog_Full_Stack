import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { z } from 'zod';
import { config } from './config.js';
import { connectCache, deleteByPattern, getJson, setJson } from './cache.js';
import { execute, pool, query } from './db.js';
import { normalizeLocale } from './i18n.js';
import { readUser, requireAdmin, signUser, verifyLogin } from './auth.js';
import { ProjectRow, PostRow, serializePost, serializeProject } from './serializers.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
});
await app.register(cookie);

const i18nShape = z.object({
  'zh-CN': z.string().min(1),
  'en-US': z.string().min(1)
});

const projectInput = z.object({
  title: i18nShape,
  slug: z.string().min(1),
  summary: i18nShape,
  description: i18nShape,
  projectUrl: z.string().optional().nullable(),
  repoUrl: z.string().optional().nullable(),
  role: i18nShape.optional().nullable(),
  tags: z.object({
    'zh-CN': z.array(z.string()),
    'en-US': z.array(z.string())
  }).optional().nullable(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(100),
  status: z.enum(['draft', 'published']).default('published')
});

const postInput = z.object({
  title: i18nShape,
  slug: z.string().min(1),
  summary: i18nShape,
  content: i18nShape,
  tags: z.object({
    'zh-CN': z.array(z.string()),
    'en-US': z.array(z.string())
  }).optional().nullable(),
  status: z.enum(['draft', 'published']).default('published')
});

function localeFromQuery(queryObj: unknown) {
  return normalizeLocale((queryObj as { locale?: string } | undefined)?.locale);
}

async function clearPublicCache() {
  await deleteByPattern('site:*');
  await deleteByPattern('projects:*');
  await deleteByPattern('posts:*');
}

app.get('/api/health', async () => {
  await pool.query('SELECT 1');
  return { ok: true, service: 'blog-api' };
});

app.get('/api/admin/me', async (request) => {
  return { user: readUser(request) };
});

app.post('/api/admin/login', async (request, reply) => {
  const body = z.object({ username: z.string(), password: z.string() }).parse(request.body);
  const user = await verifyLogin(body.username, body.password);
  if (!user) return reply.code(401).send({ message: '账号或密码错误' });
  const token = signUser(user);
  reply.setCookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: config.nodeEnv === 'production'
  });
  return { user };
});

app.post('/api/admin/logout', async (_request, reply) => {
  reply.clearCookie('token', { path: '/' });
  return { ok: true };
});

app.get('/api/site', async (request) => {
  const locale = localeFromQuery(request.query);
  const key = `site:home:${locale}`;
  const cached = await getJson(key);
  if (cached) return cached;

  const projects = await query<ProjectRow>(
    "SELECT * FROM projects WHERE status = 'published' ORDER BY is_featured DESC, sort_order ASC LIMIT 5"
  );
  const posts = await query<PostRow>(
    "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC, id DESC LIMIT 3"
  );
  const data = {
    projects: projects.map((row) => serializeProject(row, locale)),
    posts: posts.map((row) => serializePost(row, locale)),
    hero: {
      title: locale === 'en-US' ? 'Build and write' : '边做边写',
      subtitle:
        locale === 'en-US'
          ? 'A personal archive of products, systems, migrations, and practical notes.'
          : '记录产品、系统、迁移和工程实践，把踩坑后的判断留下来。'
    }
  };
  await setJson(key, data, 300);
  return data;
});

app.get('/api/projects', async (request) => {
  const locale = localeFromQuery(request.query);
  const key = `projects:list:${locale}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const rows = await query<ProjectRow>(
    "SELECT * FROM projects WHERE status = 'published' ORDER BY is_featured DESC, sort_order ASC"
  );
  const data = rows.map((row) => serializeProject(row, locale));
  await setJson(key, data, 600);
  return data;
});

app.get('/api/projects/:slug', async (request, reply) => {
  const locale = localeFromQuery(request.query);
  const slug = (request.params as { slug: string }).slug;
  const key = `projects:detail:${locale}:${slug}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const rows = await query<ProjectRow>('SELECT * FROM projects WHERE slug = :slug AND status = "published" LIMIT 1', {
    slug
  });
  if (!rows[0]) return reply.code(404).send({ message: '项目不存在' });
  const data = serializeProject(rows[0], locale);
  await setJson(key, data, 1800);
  return data;
});

app.get('/api/posts', async (request) => {
  const locale = localeFromQuery(request.query);
  const key = `posts:list:${locale}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const rows = await query<PostRow>(
    "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC, id DESC"
  );
  const data = rows.map((row) => serializePost(row, locale));
  await setJson(key, data, 300);
  return data;
});

app.get('/api/posts/:slug', async (request, reply) => {
  const locale = localeFromQuery(request.query);
  const slug = (request.params as { slug: string }).slug;
  const key = `posts:detail:${locale}:${slug}`;
  const cached = await getJson(key);
  if (cached) return cached;
  const rows = await query<PostRow>('SELECT * FROM posts WHERE slug = :slug AND status = "published" LIMIT 1', {
    slug
  });
  if (!rows[0]) return reply.code(404).send({ message: '文章不存在' });
  const data = serializePost(rows[0], locale, true);
  await setJson(key, data, 1800);
  return data;
});

app.get('/api/admin/projects', { preHandler: requireAdmin }, async () => {
  return query<ProjectRow>('SELECT * FROM projects ORDER BY sort_order ASC, id DESC');
});

app.post('/api/admin/projects', { preHandler: requireAdmin }, async (request) => {
  const body = projectInput.parse(request.body);
  await execute(
    `INSERT INTO projects
      (title_i18n, slug, summary_i18n, description_i18n, project_url, repo_url, role_i18n, tags_i18n, is_featured, sort_order, status)
     VALUES (:title, :slug, :summary, :description, :projectUrl, :repoUrl, :role, :tags, :isFeatured, :sortOrder, :status)`,
    {
      title: JSON.stringify(body.title),
      slug: body.slug,
      summary: JSON.stringify(body.summary),
      description: JSON.stringify(body.description),
      projectUrl: body.projectUrl ?? null,
      repoUrl: body.repoUrl ?? null,
      role: body.role ? JSON.stringify(body.role) : null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      isFeatured: body.isFeatured ? 1 : 0,
      sortOrder: body.sortOrder,
      status: body.status
    }
  );
  await clearPublicCache();
  return { ok: true };
});

app.put('/api/admin/projects/:id', { preHandler: requireAdmin }, async (request) => {
  const id = Number((request.params as { id: string }).id);
  const body = projectInput.parse(request.body);
  await execute(
    `UPDATE projects SET
      title_i18n = :title, slug = :slug, summary_i18n = :summary, description_i18n = :description,
      project_url = :projectUrl, repo_url = :repoUrl, role_i18n = :role, tags_i18n = :tags,
      is_featured = :isFeatured, sort_order = :sortOrder, status = :status
     WHERE id = :id`,
    {
      id,
      title: JSON.stringify(body.title),
      slug: body.slug,
      summary: JSON.stringify(body.summary),
      description: JSON.stringify(body.description),
      projectUrl: body.projectUrl ?? null,
      repoUrl: body.repoUrl ?? null,
      role: body.role ? JSON.stringify(body.role) : null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      isFeatured: body.isFeatured ? 1 : 0,
      sortOrder: body.sortOrder,
      status: body.status
    }
  );
  await clearPublicCache();
  return { ok: true };
});

app.delete('/api/admin/projects/:id', { preHandler: requireAdmin }, async (request) => {
  const id = Number((request.params as { id: string }).id);
  await execute('DELETE FROM projects WHERE id = :id', { id });
  await clearPublicCache();
  return { ok: true };
});

app.get('/api/admin/posts', { preHandler: requireAdmin }, async () => {
  return query<PostRow>('SELECT * FROM posts ORDER BY published_at DESC, id DESC');
});

app.post('/api/admin/posts', { preHandler: requireAdmin }, async (request) => {
  const body = postInput.parse(request.body);
  await execute(
    `INSERT INTO posts (title_i18n, slug, summary_i18n, content_i18n, tags_i18n, status, published_at)
     VALUES (:title, :slug, :summary, :content, :tags, :status, IF(:status = 'published', NOW(), NULL))`,
    {
      title: JSON.stringify(body.title),
      slug: body.slug,
      summary: JSON.stringify(body.summary),
      content: JSON.stringify(body.content),
      tags: body.tags ? JSON.stringify(body.tags) : null,
      status: body.status
    }
  );
  await clearPublicCache();
  return { ok: true };
});

app.put('/api/admin/posts/:id', { preHandler: requireAdmin }, async (request) => {
  const id = Number((request.params as { id: string }).id);
  const body = postInput.parse(request.body);
  await execute(
    `UPDATE posts SET title_i18n = :title, slug = :slug, summary_i18n = :summary, content_i18n = :content,
      tags_i18n = :tags, status = :status, published_at = IF(:status = 'published', COALESCE(published_at, NOW()), NULL)
     WHERE id = :id`,
    {
      id,
      title: JSON.stringify(body.title),
      slug: body.slug,
      summary: JSON.stringify(body.summary),
      content: JSON.stringify(body.content),
      tags: body.tags ? JSON.stringify(body.tags) : null,
      status: body.status
    }
  );
  await clearPublicCache();
  return { ok: true };
});

app.delete('/api/admin/posts/:id', { preHandler: requireAdmin }, async (request) => {
  const id = Number((request.params as { id: string }).id);
  await execute('DELETE FROM posts WHERE id = :id', { id });
  await clearPublicCache();
  return { ok: true };
});

await connectCache();

app.listen({ port: config.port, host: '0.0.0.0' });
