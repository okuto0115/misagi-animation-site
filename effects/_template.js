/*
【ファイル】effects/_template.js
【役割】新しい演出を作るときのテンプレ
【触ってOK】id / name / description / init の中身
【注意】1ファイル=1演出。registry.jsに登録が必要
【関連】effects/registry.js / script.js
【確認】/?fx=演出id で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 演出のID（URLの ?fx= で使う）
const EFFECT_ID = "template";
// 演出の表示名（ラボ一覧で表示）
const EFFECT_NAME = "Template Effect";
// 演出の説明文（ラボ一覧で表示）
const EFFECT_DESCRIPTION = "Short description of what this effect does.";
// ===== ここから下は基本触らない =====
export const effect = {
  id: EFFECT_ID,
  name: EFFECT_NAME,
  description: EFFECT_DESCRIPTION,
  init({ context }) {
    void context;
    return () => {};
  },
};
