/**
 * JSON値の型定義
 */
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

interface JsonObject {
  [key: string]: JsonValue;
}

type JsonArray = JsonValue[];

/**
 * 拡張されたjq風フィルタを使用してJSONオブジェクトをフィルタリングする
 * サポートする構文:
 * - .property - オブジェクトのプロパティにアクセス
 * - .property.nested - ネストされたプロパティにアクセス
 * - .array[0] - 配列の特定インデックスにアクセス
 * - .[]  - 配列のすべての要素にアクセス
 * - .property[] - プロパティから配列のすべての要素にアクセス
 * - .[].property - 配列の各要素のプロパティにアクセス
 * @param json 対象のJSONオブジェクト
 * @param filter フィルタ文字列 (例: .items[0] または .user.name)
 * @returns フィルタリングされたJSONオブジェクト
 */
export const filterJson = (json: JsonValue, filter: string): JsonValue => {
  // フィルタが空の場合は元のオブジェクトを返す
  if (!filter || filter.trim() === '') {
    return json;
  }

  // フィルタの先頭のドットを取り除く
  const normalizedFilter = filter.startsWith('.') ? filter.substring(1) : filter;

  // フィルタが空になった場合は元のオブジェクトを返す
  if (!normalizedFilter) {
    return json;
  }

  try {
    // フィルタを解析して適用する
    return applyFilter(json, normalizedFilter);
  } catch (error) {
    console.error('フィルタ適用エラー:', error);
    throw new Error(`無効なフィルタ: ${filter}`);
  }
};

/**
 * フィルタパスに基づいてJSONオブジェクトからデータを抽出する
 * @param json 対象のJSONオブジェクト
 * @param filterPath フィルタパス
 * @returns 抽出されたデータ
 */
const applyFilter = (json: JsonValue, filterPath: string): JsonValue => {
  // フィルタパスがない場合は元のオブジェクトを返す
  if (!filterPath) {
    return json;
  }

  // 配列のすべての要素に対するパターン (例: .[])
  if (filterPath === '[]') {
    if (!Array.isArray(json)) {
      throw new Error(`配列ではありません`);
    }
    return json;
  }

  // 配列インデックスのパターン (例: items[0])
  const arrayIndexPattern = /^([^\[]+)\[(\d+)\](.*)$/;
  // 配列のすべての要素のパターン (例: items[])
  const arrayAllPattern = /^([^\[]+)\[\](.*)$/;
  // ネストされたプロパティのパターン (例: user.name)
  const nestedPropertyPattern = /^([^.]+)\.(.*)$/;

  // JSONオブジェクトでない場合
  if (typeof json !== 'object' || json === null) {
    throw new Error('オブジェクトまたは配列でないプロパティにはフィルタを適用できません');
  }

  // 配列インデックスパターンにマッチする場合
  const arrayMatch = filterPath.match(arrayIndexPattern);
  if (arrayMatch) {
    const [, property, indexStr, remaining] = arrayMatch;
    const index = parseInt(indexStr, 10);

    const jsonObj = json as JsonObject;
    if (!jsonObj[property]) {
      throw new Error(`プロパティが見つかりません: ${property}`);
    }

    const propValue = jsonObj[property];
    if (!Array.isArray(propValue)) {
      throw new Error(`プロパティは配列ではありません: ${property}`);
    }

    if (index < 0 || index >= propValue.length) {
      throw new Error(`インデックスが範囲外です: ${index}`);
    }

    // 残りのパスを適用
    return remaining
      ? applyFilter(propValue[index], remaining.startsWith('.') ? remaining.substring(1) : remaining)
      : propValue[index];
  }

  // 配列のすべての要素パターンにマッチする場合
  const arrayAllMatch = filterPath.match(arrayAllPattern);
  if (arrayAllMatch) {
    const [, property, remaining] = arrayAllMatch;

    const jsonObj = json as JsonObject;
    if (!jsonObj[property]) {
      throw new Error(`プロパティが見つかりません: ${property}`);
    }

    const propValue = jsonObj[property];
    if (!Array.isArray(propValue)) {
      throw new Error(`プロパティは配列ではありません: ${property}`);
    }

    // 残りのパスがある場合は各要素に適用、なければ配列全体を返す
    if (remaining) {
      const nextFilter = remaining.startsWith('.') ? remaining.substring(1) : remaining;
      return propValue.map((item: JsonValue) => applyFilter(item, nextFilter));
    }

    return propValue;
  }

  // ネストされたプロパティパターンにマッチする場合
  const nestedMatch = filterPath.match(nestedPropertyPattern);
  if (nestedMatch) {
    const [, property, remaining] = nestedMatch;

    const jsonObj = json as JsonObject;
    if (jsonObj[property] === undefined) {
      throw new Error(`プロパティが見つかりません: ${property}`);
    }

    // 残りのパスを適用
    return applyFilter(jsonObj[property], remaining);
  }

  // 単一のプロパティの場合
  const jsonObj = json as JsonObject;
  if (jsonObj[filterPath] === undefined) {
    throw new Error(`プロパティが見つかりません: ${filterPath}`);
  }

  return jsonObj[filterPath];
};