/**
 * JSON値の型定義
 */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

/**
 * JSONをHTML形式でシンタックスハイライトして表示するためのフォーマッタ
 */
interface JsonNode {
  key?: string;
  value: JsonValue;
  path: string;
  type: string;
  isCollapsible: boolean;
  collapsed?: boolean;
}

/**
 * JSONをHTMLにフォーマットする
 * @param json JSONオブジェクト
 * @param maxInitialDepth 初期表示時の最大展開階層 (デフォルト: 1)
 * @returns HTML文字列
 */
export const formatJsonToHtml = (json: JsonValue, maxInitialDepth: number = 1): string => {
  try {
    // 初期ノードを生成
    const rootNode: JsonNode = {
      value: json,
      path: 'root',
      type: getType(json),
      isCollapsible: isCollapsible(json),
      collapsed: false
    };

    // HTMLに変換
    return `<div class="json-tree">${nodeToHtml(rootNode, 0, maxInitialDepth)}</div>`;
  } catch (error) {
    console.error('JSONフォーマットエラー:', error);
    return String(error);
  }
};

/**
 * 値の型を取得
 * @param value 任意の値
 * @returns 型名
 */
const getType = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

/**
 * 値が折りたたみ可能かどうか
 * @param value 任意の値
 * @returns 折りたたみ可能かどうか
 */
const isCollapsible = (value: JsonValue): boolean => {
  return (
    typeof value === 'object' &&
    value !== null &&
    (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)
  );
};

/**
 * ノードをHTMLに変換
 * @param node ノード
 * @param currentDepth 現在の階層
 * @param maxInitialDepth 初期表示時の最大展開階層
 * @returns HTML文字列
 */
const nodeToHtml = (node: JsonNode, currentDepth: number = 0, maxInitialDepth: number = Infinity): string => {
  const { key, value, type, isCollapsible } = node;

  // キー部分のHTML
  const keyHtml = key !== undefined
    ? `<span class="json-key">"${key}"</span>: `
    : '';

  // オブジェクトまたは配列の場合
  if (isCollapsible) {
    // 開始タグ
    const startTag = type === 'array' ? '[' : '{';
    // 終了タグ
    const endTag = type === 'array' ? ']' : '}';

    // 現在の階層が最大表示階層を超えていれば折りたたむ
    const isCollapsed = currentDepth >= maxInitialDepth;
    const toggleIcon = isCollapsed ? '▶' : '▼';
    const collapsibleStyle = isCollapsed ? ' style="display:none;"' : '';

    // 子要素
    const childrenHtml = renderChildren(value, node.path, currentDepth + 1, maxInitialDepth);

    // 折りたたみボタン付きでHTML生成
    return `<div class="json-line"><span class="json-toggle" data-path="${node.path}">${toggleIcon}</span>${keyHtml}<span class="json-${type}">${startTag}</span><div class="json-collapsible" data-path="${node.path}"${collapsibleStyle}>${childrenHtml}</div><span class="json-${type}">${endTag}</span></div>`;
  }

  // プリミティブ値の場合
  return `<div class="json-line"><span class="json-empty-toggle"></span>${keyHtml}<span class="json-${type}">${formatPrimitiveValue(value, type)}</span></div>`;
};

/**
 * 子要素をHTMLに変換
 * @param value オブジェクトまたは配列
 * @param parentPath 親要素のパス
 * @param currentDepth 現在の階層
 * @param maxInitialDepth 初期表示時の最大展開階層
 * @returns HTML文字列
 */
const renderChildren = (value: JsonValue, parentPath: string, currentDepth: number = 0, maxInitialDepth: number = Infinity): string => {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const childPath = `${parentPath}.${index}`;
      const childNode: JsonNode = {
        value: item,
        path: childPath,
        type: getType(item),
        isCollapsible: isCollapsible(item),
      };
      return nodeToHtml(childNode, currentDepth, maxInitialDepth);
    }).join('');
  }

  // オブジェクトの場合
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).map(key => {
      const objValue = value as Record<string, JsonValue>;
      const childPath = `${parentPath}.${key}`;
      const childNode: JsonNode = {
        key,
        value: objValue[key],
        path: childPath,
        type: getType(objValue[key]),
        isCollapsible: isCollapsible(objValue[key]),
      };
      return nodeToHtml(childNode, currentDepth, maxInitialDepth);
    }).join('');
  }

  return '';
};

/**
 * プリミティブ値をフォーマット
 * @param value プリミティブ値
 * @param type 型名
 * @returns フォーマット済み文字列
 */
const formatPrimitiveValue = (value: JsonValue, type: string): string => {
  switch (type) {
    case 'string':
      return `"${escapeHtml(value as string)}"`;
    case 'null':
      return 'null';
    default:
      return String(value);
  }
};

/**
 * HTML特殊文字をエスケープ
 * @param str 文字列
 * @returns エスケープ済み文字列
 */
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};