import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'JSON フォーマッタ',
  description: 'jqのようにJSONをフォーマットしフィルタリングするツール',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
    <head>
      <Script id="theme-script" strategy="beforeInteractive">
        {`
            (function() {
              try {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              } catch (e) {}
            })()
          `}
      </Script>
    </head>
    <body suppressHydrationWarning>
    <div className="min-h-screen">
      {children}
    </div>
    </body>
    </html>
  );
}