'use client';

import { ChangeEvent } from 'react';

interface ParserOptionsProps {
  autoParseJson: boolean;
  setAutoParseJson: (value: boolean) => void;
  parseFields: string;
  setParseFields: (value: string) => void;
}

export default function ParserOptions({
                                        autoParseJson,
                                        setAutoParseJson,
                                        parseFields,
                                        setParseFields
                                      }: ParserOptionsProps) {
  const handleAutoParseChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAutoParseJson(e.target.checked);
  };

  const handleParseFieldsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParseFields(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="auto-parse-json"
          checked={autoParseJson}
          onChange={handleAutoParseChange}
          className="h-4 w-4 rounded"
        />
        <label htmlFor="auto-parse-json" className="text-sm font-medium">
          文字列内のJSONを自動パース
        </label>
      </div>

      <div className="flex flex-1 items-center space-x-2">
        <label htmlFor="parse-fields" className="text-sm whitespace-nowrap">
          対象フィールド:
        </label>
        <input
          type="text"
          id="parse-fields"
          placeholder="message,data,content"
          value={parseFields}
          onChange={handleParseFieldsChange}
          className="flex-1 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 dark:bg-gray-700"
          disabled={!autoParseJson}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
          (カンマ区切りで複数指定可)
        </div>
      </div>
    </div>
  );
}