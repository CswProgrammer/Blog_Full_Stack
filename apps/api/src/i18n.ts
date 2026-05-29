export type Locale = 'zh-CN' | 'en-US';

export function normalizeLocale(input: unknown): Locale {
  return input === 'en' || input === 'en-US' ? 'en-US' : 'zh-CN';
}

export function pickI18n(value: unknown, locale: Locale) {
  if (!value) return '';
  const data = typeof value === 'string' ? JSON.parse(value) : value;
  return data?.[locale] ?? data?.['zh-CN'] ?? '';
}

export function pickI18nArray(value: unknown, locale: Locale) {
  const picked = pickI18n(value, locale);
  return Array.isArray(picked) ? picked : [];
}
