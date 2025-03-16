/**
 * JSON文字列内のJSONテキストを再帰的にパースする
 * @param jsonValue JSON値
 * @param parseFields パース対象のフィールド名（カンマ区切り）
 * @returns パース済みのJSON値
 */
export function parseJsonStrings(jsonValue: unknown, parseFields: string): unknown {
  if (!parseFields || !parseFields.trim()) {
    return jsonValue;
  }

  const targetFields = parseFields.split(',').map(field => field.trim());
  if (targetFields.length === 0) {
    return jsonValue;
  }

  // オブジェクトの場合
  if (jsonValue && typeof jsonValue === 'object' && !Array.isArray(jsonValue)) {
    const result = { ...jsonValue } as Record<string, unknown>;

    for (const [key, value] of Object.entries(result)) {
      // 対象フィールドかつ文字列の場合、JSONとしてパースを試みる
      if (targetFields.includes(key) && typeof value === 'string') {
        try {
          // 文字列がJSON形式かどうかを確認
          const trimmedValue = value.trim();
          if ((trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) ||
            (trimmedValue.startsWith('[') && trimmedValue.endsWith(']'))) {
            result[key] = JSON.parse(value);
          }
        } catch {
          // パースできない場合は元の値を維持
          console.log(`フィールド "${key}" のパースに失敗しました`);
        }
      }

      // 再帰的に処理
      result[key] = parseJsonStrings(result[key], parseFields);
    }

    return result;
  }

  // 配列の場合
  if (Array.isArray(jsonValue)) {
    return jsonValue.map(item => parseJsonStrings(item, parseFields));
  }

  // その他の型はそのまま返す
  return jsonValue;
}

/**
 * パース済みJSONをオリジナルスタイルで表示するためのフォーマット
 * @param path ノードパス
 * @param key キー名
 * @param parseFields パース対象のフィールド名（カンマ区切り）
 * @returns 強調表示のためのクラス名
 */
export function getNestedFieldClass(
  path: string,
  key: string,
  parseFields: string
): string {
  if (!parseFields || !parseFields.trim()) {
    return '';
  }

  const targetFields = parseFields.split(',').map(field => field.trim());
  if (targetFields.length === 0) {
    return '';
  }

  // パス内のキーがターゲットフィールドに含まれているかチェック
  const pathParts = path.split('.');
  for (let i = 1; i < pathParts.length; i++) {
    const fieldName = pathParts[i];
    if (targetFields.includes(fieldName)) {
      return 'nested-json-field';
    }
  }

  // 現在のキーがターゲットフィールドに含まれているかチェック
  if (targetFields.includes(key)) {
    return 'nested-json-field';
  }

  return '';
}