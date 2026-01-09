/*
【ファイル】effects/scroll-parallax.js
【役割】スクロールで奥行き感のあるレイヤーを動かす
【触ってOK】レイヤー数、移動量、透明度、素材、スムージング
【注意】fixedレイヤーを重ねるだけ。背景は壊さない
【関連】effects/registry.js / style.css
【確認】/?fx=scroll-parallax で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// レイヤー構成（上から順に「近い→遠い」の想定）
const LAYERS = [
  {
    name: "near",
    move: 120,
    opacity: 0.28,
    blur: 0,
    items: ["🐻", "●", "●", "●"],
  },
  {
    name: "mid",
    move: 70,
    opacity: 0.22,
    blur: 0.5,
    items: ["◯", "◯", "◯", "◯", "◯"],
  },
  {
    name: "far",
    move: 35,
    opacity: 0.16,
    blur: 1.5,
    items: ["✦", "✦", "✦", "✦", "✦", "✦"],
  },
];
// 追従のなめらかさ（小さいほどゆっくり追従）
const SCROLL_EASE = 0.08;
// レイヤー内の配置行数（多いほど密度が上がる）
const ROWS_PER_LAYER = 3;
// レイヤー内の配置列数（多いほど密度が上がる）
const COLS_PER_LAYER = 4;
// ===== ここから下は基本触らない =====

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const createLayer = (layer) => {
  const el = document.createElement("div");
  el.className = "parallax-layer";
  el.dataset.name = layer.name;
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "4",
    opacity: String(layer.opacity),
    filter: layer.blur ? `blur(${layer.blur}px)` : "none",
    display: "grid",
    gridTemplateColumns: `repeat(${COLS_PER_LAYER}, 1fr)`,
    gridTemplateRows: `repeat(${ROWS_PER_LAYER}, 1fr)`,
    placeItems: "center",
  });

  const totalSlots = ROWS_PER_LAYER * COLS_PER_LAYER;
  for (let i = 0; i < totalSlots; i += 1) {
    const item = document.createElement("span");
    item.className = "parallax-item";
    item.textContent = layer.items[i % layer.items.length];
    item.style.fontSize = `${14 + i * 1.2}px`;
    item.style.opacity = "0.7";
    item.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
    el.appendChild(item);
  }

  return el;
};

export const effect = {
  id: "scroll-parallax",
  name: "Scroll Parallax",
  description: "スクロールで背景レイヤーが奥行きっぽくズレる。",
  init() {
    const wrapper = document.createElement("div");
    wrapper.className = "parallax-stack";
    Object.assign(wrapper.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      zIndex: "4",
    });

    const layerEls = LAYERS.map((layer) => {
      const el = createLayer(layer);
      wrapper.appendChild(el);
      return { layer, el };
    });

    document.body.appendChild(wrapper);

    let rafId = null;
    let current = 0;
    let target = 0;

    const apply = (progress) => {
      layerEls.forEach(({ layer, el }) => {
        const offset = progress * layer.move;
        el.style.transform = `translateY(${offset.toFixed(2)}px)`;
      });
    };

    const update = () => {
      const diff = target - current;
      current += diff * SCROLL_EASE;
      apply(current);
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
      target = clamp(raw, 0, 1);
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    const handleResize = () => {
      layerEls.forEach(({ el }) => {
        el.style.gridTemplateColumns = `repeat(${COLS_PER_LAYER}, 1fr)`;
        el.style.gridTemplateRows = `repeat(${ROWS_PER_LAYER}, 1fr)`;
      });
      handleScroll();
    };

    apply(0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      wrapper.remove();
    };
  },
};
