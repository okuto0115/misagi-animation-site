import { effects } from "../effects/registry.js";

const initEffects = () => {
  const params = new URLSearchParams(window.location.search);
  const fxParam = params.get("fx");

  if (!fxParam) {
    return;
  }

  const enabledIds = fxParam
    .split(",")
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

window.addEventListener("DOMContentLoaded", initEffects);
