'use client';

import { useState, useEffect, useCallback } from 'react';
import JsonInput from '@/components/JsonInput';
import JsonOutput from '@/components/JsonOutput';
import FilterInput from '@/components/FilterInput';
import ThemeToggle from '@/components/ThemeToggle';
import { formatJson } from '@/lib/jsonFormatter';
import { filterJson } from '@/lib/jsonFilter';

export default function Home() {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // useCallbackを使用してprocessJson関数をメモ化
  const processJson = useCallback(() => {
    setError(null);
    try {
      // 入力が空の場合は処理しない
      if (!jsonInput.trim()) {
        setFormattedJson('');
        return;
      }

      // JSON文字列をパース
      let parsedJson = JSON.parse(jsonInput);

      // フィルタが指定されている場合は適用
      if (filter.trim()) {
        try {
          parsedJson = filterJson(parsedJson, filter);
        } catch (filterError) {
          setError(`フィルタエラー: ${(filterError as Error).message}`);
          return;
        }
      }

      // 整形されたJSONを設定
      setFormattedJson(formatJson(parsedJson));
    } catch (parseError) {
      setError(`JSONパースエラー: ${(parseError as Error).message}`);
    }
  }, [jsonInput, filter]);

  // JSON入力またはフィルタが変更されたときに自動的に処理を実行
  useEffect(() => {
    // デバウンス処理のためのタイマー
    const timer = setTimeout(() => {
      processJson();
    }, 500); // 入力から500ms後に処理を実行

    return () => clearTimeout(timer);
  }, [processJson]);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="flex items-center justify-between w-full max-w-6xl mb-6">
        <h1 className="text-3xl font-bold">JSON フォーマッタ</h1>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl space-y-4">
        <FilterInput
          value={filter}
          onChange={(value) => setFilter(value)}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <JsonInput
              value={jsonInput}
              onChange={(value) => setJsonInput(value)}
            />
          </div>

          <div className="w-full md:w-1/2">
            <JsonOutput formattedJson={formattedJson} />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-800 dark:text-red-300">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}