'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { dict, Locale } from '@/lib/i18n';

export function Nav({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const nextLocale: Locale = locale === 'zh' ? 'en' : 'zh';
  const languageHref = pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${nextLocale}`);
  const links = [
    { href: `/${locale}/about`, label: t.about },
    { href: `/${locale}/projects`, label: t.projects },
    { href: `/${locale}/posts`, label: t.posts },
    { href: `/${locale}/contact`, label: t.contact },
    { href: `/${locale}/admin/login`, label: t.adminLogin },
    { href: languageHref, label: t.switchLanguage }
  ];

  return (
    <nav className="nav">
      <Link href={`/${locale}`} onClick={closeMenu}>{t.home}</Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
      <button
        className="mobile-menu"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? t.close : t.menu}
      </button>
      <div id="mobile-nav-panel" className={`mobile-menu-panel${open ? ' open' : ''}`}>
        {links.map((link) => (
          <Link href={link.href} onClick={closeMenu} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
