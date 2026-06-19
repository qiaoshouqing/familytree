import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

// 从环境变量中获取姓氏
const familyName = process.env.NEXT_PUBLIC_FAMILY_NAME || '姓氏';
// 从环境变量中获取谷歌统计ID
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

export const metadata: Metadata = {
  title: `${familyName}氏族谱`,
  description: `${familyName}氏家族族谱记录`,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
      </head>
      <body className="antialiased">
        {children}
        
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
