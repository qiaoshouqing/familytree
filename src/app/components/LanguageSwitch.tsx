"use client";

import { LanguageIcon } from '@heroicons/react/24/outline';
import { useI18n } from '@/i18n/I18nProvider';

export default function LanguageSwitch() {
  const { locale, t, setLocale } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
      aria-label={t.switchToLabel}
      title={t.switchToLabel}
      className="inline-flex items-center px-3 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <LanguageIcon className="h-4 w-4 mr-1" />
      {t.switchTo}
    </button>
  );
}
