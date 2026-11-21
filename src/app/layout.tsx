import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import Script from "next/script";
import { HTML_LANG, LOCALE_COOKIE, MESSAGES, pickLocale } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getFamilyFullName } from "@/utils/config";

// 从环境变量中获取谷歌统计ID
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

// 语言：先看用户手动选过的 cookie，再看浏览器的 Accept-Language
async function getLocale() {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return pickLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerList.get("accept-language"));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const family = getFamilyFullName(locale);
  return {
    title: MESSAGES[locale].metaTitle(family),
    description: MESSAGES[locale].metaDescription(family),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={HTML_LANG[locale]}>
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
      </head>
      <body className="antialiased">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        
        {/* Google Analytics - 仅在ID存在时加载 */}
        {googleAnalyticsId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
