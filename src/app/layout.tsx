import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'JSON フォーマッタ',
  description: 'jqのようにJSONをフォーマットしフィルタリングするツール',
};

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
    <body>
    <div className="min-h-screen">
      {children}
    </div>
    <footer className="py-4 text-center text-sm opacity-70">
      © {new Date().getFullYear()} JSON フォーマッタ
    </footer>
    </body>
    </html>
  );
}