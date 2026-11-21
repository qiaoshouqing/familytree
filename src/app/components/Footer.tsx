"use client";

import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';

const Footer = () => {
  const { t, family } = useI18n();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* 左侧 - 关于 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">{t.aboutTitle}</h3>
            <p className="text-sm leading-6 text-gray-600">
              {t.aboutText(family)}
            </p>
          </div>

          {/* 中间 - 开源信息 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">{t.openSourceTitle}</h3>
            <p className="text-sm leading-6 text-gray-600">
              {t.openSourceText}
            </p>
            <p className="text-sm leading-6 text-gray-600">
              <Link
                href="https://github.com/benshandebiao/familytree"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {t.githubRepo}
              </Link>
            </p>
          </div>

          {/* 右侧 - 友情链接 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-6 text-gray-900">{t.linksTitle}</h3>
            <ul role="list" className="mt-2 space-y-2">
              <li>
                <Link
                  href="https://fatemaster.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm leading-6 text-blue-600 hover:text-blue-800"
                >
                  FateMaster.AI
                </Link>
                <p className="text-xs text-gray-500 mt-1">
                  {t.fateMasterDesc}
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权信息 */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs leading-5 text-gray-500 text-center">
            &copy; {new Date().getFullYear()} {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 