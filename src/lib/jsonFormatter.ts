/**
 * JSONオブジェクトを整形された文字列に変換する
 * @param json JSONオブジェクト
 * @param indent インデントレベル (オプション、デフォルト: 2)
 * @returns 整形されたJSON文字列
 */
export const formatJson = (json: unknown, indent: number = 2): string => {
  try {
    return JSON.stringify(json, null, indent);
  } catch (error) {
    console.error('JSONフォーマットエラー:', error);
    throw new Error('JSONの整形に失敗しました');
  }
};