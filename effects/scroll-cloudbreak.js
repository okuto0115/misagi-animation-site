/*
【ファイル】effects/scroll-cloudbreak.js
【役割】スクロールで雲を突き抜ける体験を作る
【触ってOK】雲レイヤー数、濃さ、速度、ぼかし、パッチ数
【注意】Canvasで軽量描画。重くならない設定推奨
【関連】effects/registry.js / style.css
【確認】/?fx=scroll-cloudbreak で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 雲レイヤー数（多いほど奥行きが出る）
const CLOUD_LAYERS = 3;
// 雲の基本濃さ（0〜1）
const CLOUD_OPACITY = 0.55;
// 雲の速度（スクロール進行度→移動量）
const CLOUD_SPEED = 140;
// ぼかし強さ（px）
const CLOUD_BLUR = 18;
// 雲パッチ数（多いほど濃密だが重くなる）
const CLOUD_PATCHES = 22;
// 突き抜けポイント（0〜1）
const BREAK_POINT = 0.62;
// 抜けた後の背景色（上/中/下）
const CLEAR_COLORS = ["hsl(205 80% 88%)", "hsl(210 70% 94%)", "hsl(0 0% 100%)"];
// 追従のなめらかさ（小さいほどゆっくり）
const SCROLL_EASE = 0.08;
// ===== ここから下は基本触らない =====

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const pick = (min, max) => Math.random() * (max - min) + min;

const createPatches = (width, height) => {
  const patches = [];
  for (let i = 0; i < CLOUD_PATCHES; i += 1) {
    patches.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: pick(80, 220),
      drift: pick(0.4, 1.2),
    });
  }
  return patches;
};

export const effect = {
  id: "scroll-cloudbreak",
  name: "Scroll Cloud Break",
  description: "スクロールで雲（霧）を突き抜ける体験。",
  init() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return () => {};
    }

    Object.assign(canvas.style, {
      position: "fixed",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "5",
    });
    document.body.appendChild(canvas);

    let width = 0;
    let height = 0;
    let patches = [];
    let rafId = null;
    let current = 0;
    let target = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * window.devicePixelRatio);
      canvas.height = Math.floor(height * window.devicePixelRatio);
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      patches = createPatches(width, height);
    };

    const drawBackground = (progress) => {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        0,
        width * 0.2,
        width * 0.5,
        height * 0.2,
        Math.max(width, height)
      );
      grad.addColorStop(0, CLEAR_COLORS[0]);
      grad.addColorStop(0.5, CLEAR_COLORS[1]);
      grad.addColorStop(1, CLEAR_COLORS[2]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawCloudLayer = (layerIndex, progress, opacityScale) => {
      const layerOffset = progress * CLOUD_SPEED * (1 + layerIndex * 0.35);
      ctx.globalAlpha = CLOUD_OPACITY * opacityScale * (1 - layerIndex * 0.12);
      ctx.filter = CLOUD_BLUR ? `blur(${CLOUD_BLUR}px)` : "none";

      patches.forEach((patch) => {
        const x = (patch.x + layerOffset * patch.drift) % (width + 300) - 150;
        const y = (patch.y + layerIndex * 60) % (height + 200) - 100;
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.ellipse(x, y, patch.radius, patch.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const render = () => {
      const diff = target - current;
      current += diff * SCROLL_EASE;

      ctx.clearRect(0, 0, width, height);
      drawBackground(current);

      const fade = clamp(1 - (current - BREAK_POINT) * 3, 0, 1);
      const opacityScale = current >= BREAK_POINT ? fade : 1;

      for (let i = 0; i < CLOUD_LAYERS; i += 1) {
        drawCloudLayer(i, current, opacityScale);
      }

      ctx.globalAlpha = 1;
      ctx.filter = "none";

      if (Math.abs(diff) > 0.001) {
        rafId = window.requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const raw = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      target = clamp(raw, 0, 1);
      if (!rafId) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    resize();
    drawBackground(0);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      canvas.remove();
    };
  },
};
