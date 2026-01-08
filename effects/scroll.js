/*
【ファイル】effects/scroll.js
【役割】スクロール量で背景とクマ演出を変化させる
【触ってOK】色の変化、速度倍率、イージング
【注意】requestAnimationFrameで更新。重くならない設定推奨
【関連】effects/registry.js / style.css
【確認】/?fx=scroll で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// スクロール追従のなめらかさ（小さいほどゆっくり追従）
const SCROLL_EASE = 0.08;
// 追加バーストの間隔（ms、短いほど頻繁）
const BURST_INTERVAL = 220;
// バーストの最小数（スクロール時に追加される数）
const BURST_COUNT_MIN = 2;
// バーストの最大数（スクロール時に追加される数）
const BURST_COUNT_MAX = 4;
// 背景の色変化（上部の色相スタート）
const BG_TOP_HUE_START = 10;
// 背景の色変化（上部の色相の増加量）
const BG_TOP_HUE_SHIFT = 30;
// 背景の色変化（中央の色相スタート）
const BG_MID_HUE_START = 260;
// 背景の色変化（中央の色相の減少量）
const BG_MID_HUE_SHIFT = 40;
// 背景の色変化（下部の色相スタート）
const BG_BOTTOM_HUE_START = 5;
// 背景の色変化（下部の色相の増加量）
const BG_BOTTOM_HUE_SHIFT = 15;
// 明るさの変化（上部の明るさスタート）
const BG_TOP_LIGHT_START = 96;
// 明るさの変化（上部の明るさの減少量）
const BG_TOP_LIGHT_SHIFT = 4;
// 明るさの変化（中央の明るさスタート）
const BG_MID_LIGHT_START = 95;
// 明るさの変化（中央の明るさの減少量）
const BG_MID_LIGHT_SHIFT = 5;
// 明るさの変化（下部の明るさスタート）
const BG_BOTTOM_LIGHT_START = 100;
// 明るさの変化（下部の明るさの減少量）
const BG_BOTTOM_LIGHT_SHIFT = 4;
// クマのサイズ倍率（増加量）
const BEAR_SCALE_SHIFT = 0.35;
// クマの落下速度倍率（増加量）
const BEAR_SPEED_SHIFT = 0.6;
// ===== ここから下は基本触らない =====

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const pick = (min, max) => Math.random() * (max - min) + min;

export const effect = {
  id: "scroll",
  name: "Scroll Atmosphere",
  description: "スクロール量に応じて背景とクマ演出の雰囲気を変化。",
  init({ context }) {
    let lastBurstTime = 0;
    let rafId = null;
    const scrollState = {
      current: 0,
      target: 0,
    };

    const applyScrollEffects = (progress) => {
      const topHue = BG_TOP_HUE_START + progress * BG_TOP_HUE_SHIFT;
      const midHue = BG_MID_HUE_START - progress * BG_MID_HUE_SHIFT;
      const bottomHue = BG_BOTTOM_HUE_START + progress * BG_BOTTOM_HUE_SHIFT;
      const topLight = BG_TOP_LIGHT_START - progress * BG_TOP_LIGHT_SHIFT;
      const midLight = BG_MID_LIGHT_START - progress * BG_MID_LIGHT_SHIFT;
      const bottomLight =
        BG_BOTTOM_LIGHT_START - progress * BG_BOTTOM_LIGHT_SHIFT;
      const scale = 1 + progress * BEAR_SCALE_SHIFT;
      const speed = 1 + progress * BEAR_SPEED_SHIFT;

      document.documentElement.style.setProperty(
        "--bg-top",
        `hsl(${topHue.toFixed(1)} 100% ${topLight.toFixed(1)}%)`
      );
      document.documentElement.style.setProperty(
        "--bg-mid",
        `hsl(${midHue.toFixed(1)} 80% ${midLight.toFixed(1)}%)`
      );
      document.documentElement.style.setProperty(
        "--bg-bottom",
        `hsl(${bottomHue.toFixed(1)} 20% ${bottomLight.toFixed(1)}%)`
      );
      document.documentElement.style.setProperty(
        "--bear-scale",
        scale.toFixed(3)
      );
      document.documentElement.style.setProperty(
        "--bear-speed",
        speed.toFixed(3)
      );
    };

    const updateScrollEffects = () => {
      const diff = scrollState.target - scrollState.current;
      scrollState.current += diff * SCROLL_EASE;
      applyScrollEffects(scrollState.current);

      if (Math.abs(diff) > 0.001) {
        rafId = window.requestAnimationFrame(updateScrollEffects);
      } else {
        rafId = null;
      }
    };

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollState.target = clamp(progress, 0, 1);

      const now = performance.now();
      if (context.spawnBear && now - lastBurstTime > BURST_INTERVAL) {
        lastBurstTime = now;
        const burst = Math.round(pick(BURST_COUNT_MIN, BURST_COUNT_MAX));
        context.spawnBear(burst);
      }

      if (!rafId) {
        rafId = window.requestAnimationFrame(updateScrollEffects);
      }
    };

    applyScrollEffects(0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  },
};
