'use client';

import { ChangeEvent } from 'react';

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function FilterInput({ value, onChange }: FilterInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2 flex-1">
      <label htmlFor="filter-input" className="block text-sm font-medium">
        フィルタ (例: .items[0] または .user.name)
      </label>
      <input
        id="filter-input"
        type="text"
        className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm"
        placeholder=".items[0]"
        value={value}
        onChange={handleChange}
      />
      <p className="text-xs text-gray-500">
        空白の場合は全JSONが表示されます。jq風のドット記法（.property, .array[0], .[]）を使用できます。
      </p>
    </div>
  );
}