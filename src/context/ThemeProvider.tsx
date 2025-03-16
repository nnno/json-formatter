'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // システムの設定をデフォルトとして使用
  const [theme, setTheme] = useState<Theme>('light');
  // hydration mismatchを防ぐためのフラグ
  const [mounted, setMounted] = useState(false);

  // マウント時にローカルストレージからテーマを取得
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // システムの設定をチェック
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // テーマが変更されたらHTML要素のdata-theme属性を更新
  useEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    // ローカルストレージに保存
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // テーマ切り替え関数
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// テーマを取得するカスタムフック
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}