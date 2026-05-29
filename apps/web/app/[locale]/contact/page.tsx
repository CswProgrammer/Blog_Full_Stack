import { normalizeLocale } from '@/lib/i18n';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const zh = locale === 'zh';
  return (
    <main className="contact-page">
      <section className="page-title-section archive-title">
        <div className="page-title-copy">
          <p>04 / {zh ? '联系' : 'Contact'}</p>
          <h1>{zh ? '联系入口' : 'Contact'}</h1>
        </div>
        <p className="lead">
          {zh
            ? '适合从一个明确问题开始，也适合从一次技术交流开始。'
            : 'Start from a concrete question, a collaboration idea, or a technical conversation.'}
        </p>
      </section>
      <section className="contact-content">
        <div className="contact-copy">
          <h2>
            {zh
              ? '如果你想聊产品实现、系统迁移、学习平台、管理后台，或者只是想交换一次具体问题的解法，可以直接从这里开始。'
              : 'If you want to discuss product delivery, migration, learning platforms, admin systems, or a concrete problem, start here.'}
          </h2>
          <p>邮箱： hello@example.com</p>
        </div>
        <div className="contact-list">
          {(zh ? ['项目合作', '技术交流', '文章转载', '问题反馈'] : ['Project Work', 'Tech Talk', 'Reprint', 'Feedback']).map(
            (item) => (
              <div className="contact-item" key={item}>
                <strong>{item}</strong>
                <span>{zh ? '发送邮件' : 'Email'}</span>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
