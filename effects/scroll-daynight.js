/*
【ファイル】effects/scroll-daynight.js
【役割】スクロールで昼→夕→夜の雰囲気に切り替える
【触ってOK】色、変化の強さ、スムージング、星の数
【注意】requestAnimationFrame で更新。重くならない設定推奨
【関連】effects/registry.js / style.css
【確認】/?fx=scroll-daynight で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 昼の色（背景グラデーション上/中/下）
const DAY_COLORS = ["hsl(200 80% 92%)", "hsl(210 70% 96%)", "hsl(0 0% 100%)"];
// 夕方の色
const DUSK_COLORS = ["hsl(18 90% 88%)", "hsl(330 70% 90%)", "hsl(30 80% 94%)"];
// 夜の色
const NIGHT_COLORS = ["hsl(220 55% 12%)", "hsl(235 45% 16%)", "hsl(240 40% 8%)"];
// 変化のスムージング（小さいほどゆっくり追従）
const SCROLL_EASE = 0.07;
// スクロール開始/終了位置（0〜1の範囲で調整）
const SCROLL_START = 0.0;
const SCROLL_END = 1.0;
// 星の数（少ないほど軽い）
const STAR_COUNT = 60;
// 星の最大サイズ（px）
const STAR_SIZE_MAX = 2;
// 星が見え始める進行度（0〜1）
const STAR_START = 0.55;
// 星が最大になる進行度（0〜1）
const STAR_END = 0.95;
// ===== ここから下は基本触らない =====

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;

const parseHsl = (value) => {
  const match = value.match(/hsl\(([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\)/i);
  if (!match) {
    return { h: 0, s: 0, l: 100 };
  }
  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
};

const mixHsl = (from, to, t) => {
  const a = parseHsl(from);
  const b = parseHsl(to);
  const h = lerp(a.h, b.h, t);
  const s = lerp(a.s, b.s, t);
  const l = lerp(a.l, b.l, t);
  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
};

const mixPalette = (from, to, t) =>
  from.map((color, index) => mixHsl(color, to[index], t));

const createStars = () => {
  const container = document.createElement("div");
  container.className = "daynight-stars";
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "5",
  });

  for (let i = 0; i < STAR_COUNT; i += 1) {
    const star = document.createElement("span");
    const size = Math.random() * STAR_SIZE_MAX + 0.5;
    star.style.position = "absolute";
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.borderRadius = "50%";
    star.style.background = "rgba(255, 255, 255, 0.9)";
    star.style.opacity = "0";
    container.appendChild(star);
  }

  document.body.appendChild(container);
  return container;
};

export const effect = {
  id: "scroll-daynight",
  name: "Scroll Day→Night",
  description: "スクロールで時間帯が昼→夕→夜へ遷移する。",
  init() {
    let rafId = null;
    let current = 0;
    let target = 0;
    const stars = createStars();
    const starNodes = Array.from(stars.children);

    const applyBackground = (progress) => {
      const eased = clamp(progress, 0, 1);
      let colors = DAY_COLORS;

      if (eased < 0.5) {
        const t = eased / 0.5;
        colors = mixPalette(DAY_COLORS, DUSK_COLORS, t);
      } else {
        const t = (eased - 0.5) / 0.5;
        colors = mixPalette(DUSK_COLORS, NIGHT_COLORS, t);
      }

      document.body.style.background = `radial-gradient(circle at top, ${colors[0]} 0%, ${colors[1]} 45%, ${colors[2]} 100%)`;
    };

    const applyStars = (progress) => {
      const t = clamp(
        (progress - STAR_START) / Math.max(0.001, STAR_END - STAR_START),
        0,
        1
      );
      const opacity = t.toFixed(3);
      starNodes.forEach((node) => {
        node.style.opacity = opacity;
      });
    };

    const update = () => {
      const diff = target - current;
      current += diff * SCROLL_EASE;
      applyBackground(current);
      applyStars(current);
      if (Math.abs(diff) > 0.001) {
        rafId = window.requestAnimationFrame(update);
      } else {
        rafId = null;
      }
    };

    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const raw = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const normalized = clamp(
        (raw - SCROLL_START) / Math.max(0.001, SCROLL_END - SCROLL_START),
        0,
        1
      );
      target = normalized;
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    applyBackground(0);
    applyStars(0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      stars.remove();
      document.body.style.background = "";
    };
  },
};
