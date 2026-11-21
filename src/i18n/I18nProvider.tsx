"use client";

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { HTML_LANG, LOCALE_COOKIE, Locale, MESSAGES, Messages } from './messages';
import { getFamilyFullName } from '@/utils/config';

interface I18n {
  locale: Locale;
  t: Messages;
  family: string; // 当前语言下的完整姓氏：「白氏」/「The Bai」
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    // 记住选择，服务器下次按它渲染标题和 <html lang>
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = HTML_LANG[next];
    const family = getFamilyFullName(next);
    document.title = MESSAGES[next].metaTitle(family);
    document.querySelector('meta[name="description"]')?.setAttribute('content', MESSAGES[next].metaDescription(family));
  }, []);

  const value = useMemo(
    () => ({ locale, t: MESSAGES[locale], family: getFamilyFullName(locale), setLocale }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
