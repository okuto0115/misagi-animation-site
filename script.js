/*
【ファイル】script.js
【役割】演出の起動とページ全体の動きを管理する
【触ってOK】演出のON/OFF方式、初期化処理
【注意】effects配下は「1ファイル=1演出」。ここで呼び出す
【関連】effects/*.js / index.html
【確認】/?fx=fall などで動作確認
*/
import { effects } from "./effects/registry.js";
import { loader as bearLoader } from "./effects/loader-bearrun.js";

// ===== 調整パラメータ（ここだけ触ってOK）=====
// 演出指定に使うクエリ名（例: ?fx=fall）
const FX_QUERY_KEY = "fx";
// 複数指定の区切り文字（例: ?fx=fall,scroll）
const FX_SEPARATOR = ",";
// ===== ここから下は基本触らない =====

const initLoader = (params) => {
  const loaderParam = params.get("loader");
  if (loaderParam === "0") {
    return;
  }
  bearLoader.init({ params });
};

const initEffects = (params) => {
  const fxParam = params.get(FX_QUERY_KEY);

  if (!fxParam) {
    return;
  }

  const enabledIds = fxParam
    .split(FX_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!enabledIds.length) {
    return;
  }

  const effectMap = new Map(effects.map((effect) => [effect.id, effect]));
  const enabledEffects = enabledIds
    .map((id) => effectMap.get(id))
    .filter(Boolean);
  if (!enabledEffects.length) {
    return;
  }

  const context = {
    shared: {},
    spawnBear: null,
    setBearSpawner(spawner) {
      context.spawnBear = spawner;
    },
  };

  const cleanups = [];

  enabledEffects.forEach((effect) => {
    if (typeof effect.init === "function") {
      const cleanup = effect.init({ context, params });
      if (typeof cleanup === "function") {
        cleanups.push(cleanup);
      }
    }
  });

  window.addEventListener("beforeunload", () => {
    cleanups.forEach((cleanup) => cleanup());
  });
};

const initPage = () => {
  const params = new URLSearchParams(window.location.search);
  initLoader(params);
  initEffects(params);
};

window.addEventListener("DOMContentLoaded", initPage);
