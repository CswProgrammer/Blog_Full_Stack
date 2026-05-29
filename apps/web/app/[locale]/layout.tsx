import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { normalizeLocale } from '@/lib/i18n';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  return (
    <div className="page">
      <Nav locale={locale} />
      {children}
      <Footer locale={locale} />
    </div>
  );
}
