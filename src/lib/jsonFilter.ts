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
export const filterJson = (json: any, filter: string): any => {
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
const applyFilter = (json: any, filterPath: string): any => {
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

  // 配列インデックスパターンにマッチする場合
  const arrayMatch = filterPath.match(arrayIndexPattern);
  if (arrayMatch) {
    const [, property, indexStr, remaining] = arrayMatch;
    const index = parseInt(indexStr, 10);

    if (!json[property]) {
      throw new Error(`プロパティが見つかりません: ${property}`);
    }

    if (!Array.isArray(json[property])) {
      throw new Error(`プロパティは配列ではありません: ${property}`);
    }

    if (index < 0 || index >= json[property].length) {
      throw new Error(`インデックスが範囲外です: ${index}`);
    }

    // 残りのパスを適用
    return remaining ? applyFilter(json[property][index], remaining.startsWith('.') ? remaining.substring(1) : remaining) : json[property][index];
  }

  // 配列のすべての要素パターンにマッチする場合
  const arrayAllMatch = filterPath.match(arrayAllPattern);
  if (arrayAllMatch) {
    const [, property, remaining] = arrayAllMatch;

    if (!json[property]) {
      throw new Error(`プロパティが見つかりません: ${property}`);
    }

    if (!Array.isArray(json[property])) {
      throw new Error(`プロパティは配列ではありません: ${property}`);
    }

    // 残りのパスがある場合は各要素に適用、なければ配列全体を返す
    if (remaining) {
      const nextFilter = remaining.startsWith('.') ? remaining.substring(1) : remaining;
      return json[property].map((item: any) => applyFilter(item, nextFilter));
    }

    return json[property];
  }

  // ネストされたプロパティパターンにマッチする場合
  const nestedMatch = filterPath.match(nestedPropertyPattern);
  if (nestedMatch) {
    const [, property, remaining] = nestedMatch;

    if (json[property] === undefined) {
      throw new Error(`プロパティが見つかりません: ${property}`);
    }

    // 残りのパスを適用
    return applyFilter(json[property], remaining);
  }

  // 単一のプロパティの場合
  if (json[filterPath] === undefined) {
    throw new Error(`プロパティが見つかりません: ${filterPath}`);
  }

  return json[filterPath];
};