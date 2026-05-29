'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_BASE = '';

type I18nText = {
  'zh-CN': string;
  'en-US': string;
};

type I18nList = {
  'zh-CN': string[];
  'en-US': string[];
};

type RawProject = {
  id: number;
  slug: string;
  title_i18n: string | I18nText;
  summary_i18n: string | I18nText;
  description_i18n: string | I18nText;
  project_url?: string | null;
  repo_url?: string | null;
  role_i18n?: string | I18nText | null;
  tags_i18n?: string | I18nList | null;
  is_featured: number | boolean;
  sort_order: number;
  status: 'draft' | 'published';
};

type RawPost = {
  id: number;
  slug: string;
  title_i18n: string | I18nText;
  summary_i18n: string | I18nText;
  content_i18n: string | I18nText;
  tags_i18n?: string | I18nList | null;
  status: 'draft' | 'published';
};

type ProjectForm = {
  titleZh: string;
  titleEn: string;
  slug: string;
  summaryZh: string;
  summaryEn: string;
  descriptionZh: string;
  descriptionEn: string;
  roleZh: string;
  roleEn: string;
  projectUrl: string;
  repoUrl: string;
  tagsZh: string;
  tagsEn: string;
  isFeatured: boolean;
  sortOrder: string;
  status: 'draft' | 'published';
};

type PostForm = {
  titleZh: string;
  titleEn: string;
  slug: string;
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
  tagsZh: string;
  tagsEn: string;
  status: 'draft' | 'published';
};

const emptyProjectForm: ProjectForm = {
  titleZh: '',
  titleEn: '',
  slug: '',
  summaryZh: '',
  summaryEn: '',
  descriptionZh: '',
  descriptionEn: '',
  roleZh: '',
  roleEn: '',
  projectUrl: '',
  repoUrl: '',
  tagsZh: '',
  tagsEn: '',
  isFeatured: false,
  sortOrder: '100',
  status: 'draft'
};

const emptyPostForm: PostForm = {
  titleZh: '',
  titleEn: '',
  slug: '',
  summaryZh: '',
  summaryEn: '',
  contentZh: '',
  contentEn: '',
  tagsZh: '',
  tagsEn: '',
  status: 'draft'
};

function parseJson<T>(value: string | T | null | undefined, fallback: T): T {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function textOf(value: string | I18nText | null | undefined) {
  const data = parseJson<I18nText>(value, { 'zh-CN': '', 'en-US': '' });
  return data['zh-CN'] || data['en-US'] || '';
}

function csvToList(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToCsv(value: string | I18nList | null | undefined, locale: keyof I18nList) {
  return parseJson<I18nList>(value, { 'zh-CN': [], 'en-US': [] })[locale].join('，');
}

function slugify(value: string, prefix: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `${prefix}-${Date.now()}`
  );
}

async function api(path: string, init?: RequestInit) {
  const headers = {
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {})
  };
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
    ...init
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? '操作失败');
  }
  return res.json();
}

export default function AdminPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? 'zh';
  const zh = locale !== 'en';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<'projects' | 'posts'>('projects');
  const [projects, setProjects] = useState<RawProject[]>([]);
  const [posts, setPosts] = useState<RawPost[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm);
  const [postForm, setPostForm] = useState<PostForm>(emptyPostForm);
  const [message, setMessage] = useState('');

  const labels = useMemo(
    () => ({
      adminOnly: zh ? '需要管理员登录' : 'Admin only',
      goLogin: zh ? '去登录' : 'Go to login',
      logout: zh ? '退出' : 'Logout',
      projects: zh ? '项目管理' : 'Projects',
      posts: zh ? '文章管理' : 'Posts',
      addProject: zh ? '新增项目草稿' : 'Add project draft',
      saveProject: zh ? '保存项目' : 'Save project',
      addPost: zh ? '新增文章草稿' : 'Add post draft',
      savePost: zh ? '保存文章' : 'Save post',
      cancel: zh ? '取消编辑' : 'Cancel',
      edit: zh ? '编辑' : 'Edit',
      delete: zh ? '删除' : 'Delete',
      saved: zh ? '已保存' : 'Saved',
      deleted: zh ? '已删除' : 'Deleted',
      confirmDelete: zh ? '确定删除吗？' : 'Delete this item?'
    }),
    [zh]
  );

  async function load() {
    const me = await api('/api/admin/me');
    if (!me.user) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    const [projectRows, postRows] = await Promise.all([
      api('/api/admin/projects'),
      api('/api/admin/posts')
    ]);
    setProjects(projectRows);
    setPosts(postRows);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => {
      setAuthed(false);
      setLoading(false);
    });
  }, []);

  function projectPayload() {
    const slug = projectForm.slug || slugify(projectForm.titleEn || projectForm.titleZh, 'project');
    return {
      title: { 'zh-CN': projectForm.titleZh, 'en-US': projectForm.titleEn || projectForm.titleZh },
      slug,
      summary: { 'zh-CN': projectForm.summaryZh, 'en-US': projectForm.summaryEn || projectForm.summaryZh },
      description: {
        'zh-CN': projectForm.descriptionZh,
        'en-US': projectForm.descriptionEn || projectForm.descriptionZh
      },
      projectUrl: projectForm.projectUrl || null,
      repoUrl: projectForm.repoUrl || null,
      role: { 'zh-CN': projectForm.roleZh, 'en-US': projectForm.roleEn || projectForm.roleZh },
      tags: { 'zh-CN': csvToList(projectForm.tagsZh), 'en-US': csvToList(projectForm.tagsEn || projectForm.tagsZh) },
      isFeatured: projectForm.isFeatured,
      sortOrder: Number(projectForm.sortOrder) || 100,
      status: projectForm.status
    };
  }

  function postPayload() {
    const slug = postForm.slug || slugify(postForm.titleEn || postForm.titleZh, 'post');
    return {
      title: { 'zh-CN': postForm.titleZh, 'en-US': postForm.titleEn || postForm.titleZh },
      slug,
      summary: { 'zh-CN': postForm.summaryZh, 'en-US': postForm.summaryEn || postForm.summaryZh },
      content: { 'zh-CN': postForm.contentZh, 'en-US': postForm.contentEn || postForm.contentZh },
      tags: { 'zh-CN': csvToList(postForm.tagsZh), 'en-US': csvToList(postForm.tagsEn || postForm.tagsZh) },
      status: postForm.status
    };
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault();
    if (!projectForm.titleZh.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      const path = editingProjectId ? `/api/admin/projects/${editingProjectId}` : '/api/admin/projects';
      await api(path, { method: editingProjectId ? 'PUT' : 'POST', body: JSON.stringify(projectPayload()) });
      setProjectForm(emptyProjectForm);
      setEditingProjectId(null);
      setMessage(labels.saved);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setSaving(false);
    }
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    if (!postForm.titleZh.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      const path = editingPostId ? `/api/admin/posts/${editingPostId}` : '/api/admin/posts';
      await api(path, { method: editingPostId ? 'PUT' : 'POST', body: JSON.stringify(postPayload()) });
      setPostForm(emptyPostForm);
      setEditingPostId(null);
      setMessage(labels.saved);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setSaving(false);
    }
  }

  function editProject(project: RawProject) {
    const title = parseJson<I18nText>(project.title_i18n, { 'zh-CN': '', 'en-US': '' });
    const summary = parseJson<I18nText>(project.summary_i18n, { 'zh-CN': '', 'en-US': '' });
    const description = parseJson<I18nText>(project.description_i18n, { 'zh-CN': '', 'en-US': '' });
    const role = parseJson<I18nText>(project.role_i18n, { 'zh-CN': '', 'en-US': '' });
    setTab('projects');
    setEditingProjectId(project.id);
    setProjectForm({
      titleZh: title['zh-CN'],
      titleEn: title['en-US'],
      slug: project.slug,
      summaryZh: summary['zh-CN'],
      summaryEn: summary['en-US'],
      descriptionZh: description['zh-CN'],
      descriptionEn: description['en-US'],
      roleZh: role['zh-CN'],
      roleEn: role['en-US'],
      projectUrl: project.project_url ?? '',
      repoUrl: project.repo_url ?? '',
      tagsZh: listToCsv(project.tags_i18n, 'zh-CN'),
      tagsEn: listToCsv(project.tags_i18n, 'en-US'),
      isFeatured: Boolean(project.is_featured),
      sortOrder: String(project.sort_order ?? 100),
      status: project.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editPost(post: RawPost) {
    const title = parseJson<I18nText>(post.title_i18n, { 'zh-CN': '', 'en-US': '' });
    const summary = parseJson<I18nText>(post.summary_i18n, { 'zh-CN': '', 'en-US': '' });
    const content = parseJson<I18nText>(post.content_i18n, { 'zh-CN': '', 'en-US': '' });
    setTab('posts');
    setEditingPostId(post.id);
    setPostForm({
      titleZh: title['zh-CN'],
      titleEn: title['en-US'],
      slug: post.slug,
      summaryZh: summary['zh-CN'],
      summaryEn: summary['en-US'],
      contentZh: content['zh-CN'],
      contentEn: content['en-US'],
      tagsZh: listToCsv(post.tags_i18n, 'zh-CN'),
      tagsEn: listToCsv(post.tags_i18n, 'en-US'),
      status: post.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function removeProject(id: number) {
    if (!window.confirm(labels.confirmDelete)) return;
    await api(`/api/admin/projects/${id}`, { method: 'DELETE' });
    setMessage(labels.deleted);
    await load();
  }

  async function removePost(id: number) {
    if (!window.confirm(labels.confirmDelete)) return;
    await api(`/api/admin/posts/${id}`, { method: 'DELETE' });
    setMessage(labels.deleted);
    await load();
  }

  async function logout() {
    await api('/api/admin/logout', { method: 'POST' });
    router.push(`/${locale}/admin/login`);
  }

  if (loading) return <main className="section">Loading...</main>;

  if (!authed) {
    return (
      <main className="section">
        <h1 className="section-title">{labels.adminOnly}</h1>
        <button className="button" onClick={() => router.push(`/${locale}/admin/login`)}>
          {labels.goLogin}
        </button>
      </main>
    );
  }

  return (
    <main className="section admin-page">
      <div className="section-head">
        <h1 className="section-title">{tab === 'projects' ? labels.projects : labels.posts}</h1>
        <button className="button" onClick={logout}>
          {labels.logout}
        </button>
      </div>

      <div className="admin-tabs">
        <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')} type="button">
          {labels.projects}
        </button>
        <button className={tab === 'posts' ? 'active' : ''} onClick={() => setTab('posts')} type="button">
          {labels.posts}
        </button>
      </div>

      {message ? <p className="admin-message">{message}</p> : null}

      {tab === 'projects' ? (
        <>
          <form className="admin-form" onSubmit={saveProject}>
            <input className="input" placeholder="中文标题" value={projectForm.titleZh} onChange={(event) => setProjectForm({ ...projectForm, titleZh: event.target.value })} />
            <input className="input" placeholder="英文标题" value={projectForm.titleEn} onChange={(event) => setProjectForm({ ...projectForm, titleEn: event.target.value })} />
            <input className="input" placeholder="slug" value={projectForm.slug} onChange={(event) => setProjectForm({ ...projectForm, slug: event.target.value })} />
            <select className="input" value={projectForm.status} onChange={(event) => setProjectForm({ ...projectForm, status: event.target.value as ProjectForm['status'] })}>
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
            <textarea className="textarea" placeholder="中文摘要" value={projectForm.summaryZh} onChange={(event) => setProjectForm({ ...projectForm, summaryZh: event.target.value })} />
            <textarea className="textarea" placeholder="英文摘要" value={projectForm.summaryEn} onChange={(event) => setProjectForm({ ...projectForm, summaryEn: event.target.value })} />
            <textarea className="textarea" placeholder="中文详情" value={projectForm.descriptionZh} onChange={(event) => setProjectForm({ ...projectForm, descriptionZh: event.target.value })} />
            <textarea className="textarea" placeholder="英文详情" value={projectForm.descriptionEn} onChange={(event) => setProjectForm({ ...projectForm, descriptionEn: event.target.value })} />
            <input className="input" placeholder="中文角色" value={projectForm.roleZh} onChange={(event) => setProjectForm({ ...projectForm, roleZh: event.target.value })} />
            <input className="input" placeholder="英文角色" value={projectForm.roleEn} onChange={(event) => setProjectForm({ ...projectForm, roleEn: event.target.value })} />
            <input className="input" placeholder="项目地址" value={projectForm.projectUrl} onChange={(event) => setProjectForm({ ...projectForm, projectUrl: event.target.value })} />
            <input className="input" placeholder="仓库地址" value={projectForm.repoUrl} onChange={(event) => setProjectForm({ ...projectForm, repoUrl: event.target.value })} />
            <input className="input" placeholder="中文标签，用逗号分隔" value={projectForm.tagsZh} onChange={(event) => setProjectForm({ ...projectForm, tagsZh: event.target.value })} />
            <input className="input" placeholder="英文标签，用逗号分隔" value={projectForm.tagsEn} onChange={(event) => setProjectForm({ ...projectForm, tagsEn: event.target.value })} />
            <input className="input" placeholder="排序" value={projectForm.sortOrder} onChange={(event) => setProjectForm({ ...projectForm, sortOrder: event.target.value })} />
            <label className="check-row">
              <input type="checkbox" checked={projectForm.isFeatured} onChange={(event) => setProjectForm({ ...projectForm, isFeatured: event.target.checked })} />
              主项目
            </label>
            <div className="admin-actions">
              <button className="button" type="submit" disabled={saving}>
                {editingProjectId ? labels.saveProject : labels.addProject}
              </button>
              {editingProjectId ? (
                <button className="button secondary" type="button" onClick={() => { setEditingProjectId(null); setProjectForm(emptyProjectForm); }}>
                  {labels.cancel}
                </button>
              ) : null}
            </div>
          </form>

          <div className="post-list admin-list">
            {projects.map((project) => (
              <div className="post-row" key={project.id}>
                <div>
                  <h3 className="post-title">{textOf(project.title_i18n)}</h3>
                  <p className="muted">{project.slug} / {project.status}</p>
                </div>
                <div className="admin-bar">
                  <button className="button" type="button" onClick={() => editProject(project)}>
                    {labels.edit}
                  </button>
                  <button className="button" type="button" onClick={() => removeProject(project.id)}>
                    {labels.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <form className="admin-form" onSubmit={savePost}>
            <input className="input" placeholder="中文标题" value={postForm.titleZh} onChange={(event) => setPostForm({ ...postForm, titleZh: event.target.value })} />
            <input className="input" placeholder="英文标题" value={postForm.titleEn} onChange={(event) => setPostForm({ ...postForm, titleEn: event.target.value })} />
            <input className="input" placeholder="slug" value={postForm.slug} onChange={(event) => setPostForm({ ...postForm, slug: event.target.value })} />
            <select className="input" value={postForm.status} onChange={(event) => setPostForm({ ...postForm, status: event.target.value as PostForm['status'] })}>
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
            <textarea className="textarea" placeholder="中文摘要" value={postForm.summaryZh} onChange={(event) => setPostForm({ ...postForm, summaryZh: event.target.value })} />
            <textarea className="textarea" placeholder="英文摘要" value={postForm.summaryEn} onChange={(event) => setPostForm({ ...postForm, summaryEn: event.target.value })} />
            <textarea className="textarea tall" placeholder="中文正文" value={postForm.contentZh} onChange={(event) => setPostForm({ ...postForm, contentZh: event.target.value })} />
            <textarea className="textarea tall" placeholder="英文正文" value={postForm.contentEn} onChange={(event) => setPostForm({ ...postForm, contentEn: event.target.value })} />
            <input className="input" placeholder="中文标签，用逗号分隔" value={postForm.tagsZh} onChange={(event) => setPostForm({ ...postForm, tagsZh: event.target.value })} />
            <input className="input" placeholder="英文标签，用逗号分隔" value={postForm.tagsEn} onChange={(event) => setPostForm({ ...postForm, tagsEn: event.target.value })} />
            <div className="admin-actions">
              <button className="button" type="submit" disabled={saving}>
                {editingPostId ? labels.savePost : labels.addPost}
              </button>
              {editingPostId ? (
                <button className="button secondary" type="button" onClick={() => { setEditingPostId(null); setPostForm(emptyPostForm); }}>
                  {labels.cancel}
                </button>
              ) : null}
            </div>
          </form>

          <div className="post-list admin-list">
            {posts.map((post) => (
              <div className="post-row" key={post.id}>
                <div>
                  <h3 className="post-title">{textOf(post.title_i18n)}</h3>
                  <p className="muted">{post.slug} / {post.status}</p>
                </div>
                <div className="admin-bar">
                  <button className="button" type="button" onClick={() => editPost(post)}>
                    {labels.edit}
                  </button>
                  <button className="button" type="button" onClick={() => removePost(post.id)}>
                    {labels.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
