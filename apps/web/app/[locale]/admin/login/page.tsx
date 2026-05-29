'use client';

import { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_BASE = '';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params.locale ?? 'zh';
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.message ?? (locale === 'en' ? 'Login failed' : '登录失败，请检查账号密码'));
        return;
      }
      router.replace(`/${locale}/admin`);
      router.refresh();
    } catch {
      setMessage(locale === 'en' ? 'Network error, please try again' : '网络异常，请确认后端服务已启动');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="section">
      <h1 className="section-title">{locale === 'en' ? 'Login' : '管理员登录'}</h1>
      <form className="form" onSubmit={onSubmit} style={{ marginTop: 32 }}>
        <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} />
        <input
          className="input"
          type="password"
          placeholder={locale === 'en' ? 'Password' : '密码'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button className="button" type="submit" disabled={submitting}>
          {submitting ? (locale === 'en' ? 'Logging in...' : '登录中...') : locale === 'en' ? 'Login' : '登录'}
        </button>
        {message ? <p className="muted">{message}</p> : null}
      </form>
    </main>
  );
}
