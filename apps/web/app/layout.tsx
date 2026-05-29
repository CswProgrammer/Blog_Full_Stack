import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '个人博客与项目档案',
  description: '产品、系统、迁移和工程实践记录'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
