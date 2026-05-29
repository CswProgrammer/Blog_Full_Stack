import { dict, Locale } from '@/lib/i18n';

export function Footer({ locale }: { locale: Locale }) {
  const t = dict[locale];
  return (
    <footer className="footer">
      <strong>{t.footer}</strong>
      <span className="muted">{t.repo}</span>
    </footer>
  );
}
