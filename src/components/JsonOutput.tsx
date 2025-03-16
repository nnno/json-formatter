'use client';

import { useEffect, useRef, useState } from 'react';
import { formatJsonToHtml } from '@/lib/jsonOutputFormatter';

interface JsonOutputProps {
  formattedJson: string;
  parseFields?: string;
}

export default function JsonOutput({ formattedJson, parseFields = '' }: JsonOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const [expandDepth, setExpandDepth] = useState<number>(3);

  useEffect(() => {
    if (!outputRef.current || !formattedJson) return;

    try {
      // JSON文字列をオブジェクトとしてパースする
      const jsonObj = JSON.parse(formattedJson);
      // HTMLにフォーマットして表示（指定した深さまで展開）
      outputRef.current.innerHTML = formatJsonToHtml(jsonObj, expandDepth, parseFields);

      // 折りたたみトグルのイベントリスナーを設定
      const toggleElements = outputRef.current.querySelectorAll('.json-toggle');
      toggleElements.forEach(el => {
        el.addEventListener('click', function(this: HTMLElement) {
          // トグルボタンの状態を変更
          this.textContent = this.textContent === '▼' ? '▶' : '▼';

          // 対応する折りたたみ要素の表示/非表示を切り替え
          const path = this.getAttribute('data-path');
          const collapsible = outputRef.current?.querySelector(`.json-collapsible[data-path="${path}"]`);
          if (collapsible) {
            (collapsible as HTMLElement).style.display =
              (collapsible as HTMLElement).style.display === 'none' ? 'block' : 'none';
          }
        });
      });
    } catch (err) {
      console.error('JSONパース中のエラー:', err);
      outputRef.current.textContent = formattedJson || '結果がここに表示されます';
    }
  }, [formattedJson, expandDepth, parseFields]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      alert('クリップボードにコピーしました');
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました', err);
    }
  };

  // 全て折りたたむ
  const collapseAll = () => {
    if (!outputRef.current) return;

    // Level 1以外のすべてのトグルを折りたたみ状態に変更
    const toggles = outputRef.current.querySelectorAll('.json-toggle:not([data-path="root"])');
    toggles.forEach(toggle => {
      (toggle as HTMLElement).textContent = '▶';
    });

    // Level 1以外のすべての折りたたみ要素を非表示
    const collapsibles = outputRef.current.querySelectorAll('.json-collapsible:not([data-path="root"])');
    collapsibles.forEach(collapsible => {
      (collapsible as HTMLElement).style.display = 'none';
    });

    // Root要素のトグルは展開状態に
    const rootToggle = outputRef.current.querySelector('.json-toggle[data-path="root"]');
    if (rootToggle) {
      (rootToggle as HTMLElement).textContent = '▼';
    }

    // Root要素の直下は表示
    const rootCollapsible = outputRef.current.querySelector('.json-collapsible[data-path="root"]');
    if (rootCollapsible) {
      (rootCollapsible as HTMLElement).style.display = 'block';
    }
  };

  // 展開レベルを変更
  const handleDepthChange = (depth: number) => {
    setExpandDepth(depth);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center h-8">
        <label htmlFor="json-output" className="block text-sm font-medium">
          フォーマット済みJSON
        </label>
        <div className="flex space-x-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleDepthChange(level)}
                className={`text-xs px-2 py-1 border rounded ${
                  expandDepth === level
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {level}
              </button>
            ))}
            <button
              onClick={() => handleDepthChange(99)}
              className={`text-xs px-2 py-1 border rounded ${
                expandDepth === 99
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              全展開
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
            >
              全折畳
            </button>
          </div>
          {formattedJson && (
            <button
              onClick={copyToClipboard}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              コピー
            </button>
          )}
        </div>
      </div>

      <div
        ref={outputRef}
        id="json-output"
        className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 h-[700px] overflow-auto whitespace-pre"
      >
        結果がここに表示されます
      </div>
    </div>
  );
}