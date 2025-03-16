'use client';

import { ChangeEvent, useRef, useState, DragEvent } from 'react';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JsonInput({ value, onChange }: JsonInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const processJsonFile = (file: File) => {
    // ファイルサイズチェック (10MB上限)
    if (file.size > 10 * 1024 * 1024) {
      alert('ファイルサイズは10MB以下にしてください');
      return;
    }

    // JSONファイルチェック
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      alert('JSONファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // JSONとして解析できるか確認
        JSON.parse(content);
        onChange(content);
      } catch (error) {
        alert('有効なJSONファイルではありません');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processJsonFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processJsonFile(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="h-8 flex items-center justify-between">
        <label htmlFor="json-input" className="block text-sm font-medium">
          JSON入力
        </label>
        <button
          onClick={triggerFileUpload}
          className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100"
        >
          JSONファイルを開く
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json,application/json"
          onChange={handleFileUpload}
        />
      </div>
      <textarea
        id="json-input"
        className={`w-full p-3 border border-gray-300 rounded-md font-mono text-sm h-[700px] overflow-auto ${
          isDragging ? 'bg-blue-50 border-blue-300' : ''
        }`}
        placeholder='{"example": "ここにJSONを入力してください"} または JSONファイルをここにドラッグ&ドロップ'
        value={value}
        onChange={handleChange}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
}