/*
【ファイル】effects/fall.js
【役割】クマが降ってくる演出を定義する
【触ってOK】数・サイズ・速度のパラメータ
【注意】見た目の基本は style.css。ここは生成ロジック
【関連】effects/registry.js / style.css
【確認】/?fx=fall で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// クマの基本出現数（画面幅に応じて増える基準値）
const BEAR_COUNT_BASE = 24;
// クマの最大出現数（多いほど派手になる）
const BEAR_COUNT_MAX = 46;
// クマの最小出現数（少なすぎると寂しい）
const BEAR_COUNT_MIN = 14;
// クマの最小サイズ（小さいほど繊細）
const BEAR_SIZE_MIN = 20;
// クマの最大サイズ（大きいほど迫力）
const BEAR_SIZE_MAX = 42;
// 落下アニメの最短秒数（短いほど速い）
const BEAR_DURATION_MIN = 2.8;
// 落下アニメの最長秒数（長いほどゆっくり）
const BEAR_DURATION_MAX = 5.2;
// 出現ディレイの最短秒数（同時に降る）
const BEAR_DELAY_MIN = 0;
// 出現ディレイの最長秒数（ばらける）
const BEAR_DELAY_MAX = 0.8;
// 画面幅に対する出現数の増え方（小さいほど多い）
const COUNT_DIVISOR = 40;
// ===== ここから下は基本触らない =====

const pick = (min, max) => Math.random() * (max - min) + min;

const createBear = (container) => {
  const bear = document.createElement("div");
  bear.className = "bear";
  bear.textContent = "🐻";
  const size = Math.round(pick(BEAR_SIZE_MIN, BEAR_SIZE_MAX));
  const duration = pick(BEAR_DURATION_MIN, BEAR_DURATION_MAX);
  const delay = pick(BEAR_DELAY_MIN, BEAR_DELAY_MAX);
  const left = pick(0, 100);

  bear.style.setProperty("--size", `${size}px`);
  bear.style.setProperty("--duration", `${duration}s`);
  bear.style.setProperty("--delay", `${delay}s`);
  bear.style.left = `${left}%`;
  container.appendChild(bear);

  bear.addEventListener("animationend", () => {
    bear.remove();
  });
};

const createInitialBurst = (container) => {
  const width = window.innerWidth;
  const base = Math.round(width / COUNT_DIVISOR);
  const count = Math.min(
    BEAR_COUNT_MAX,
    Math.max(BEAR_COUNT_MIN, BEAR_COUNT_BASE + base)
  );

  for (let i = 0; i < count; i += 1) {
    createBear(container);
  }
};

export const effect = {
  id: "fall",
  name: "Bear Fall",
  description: "画面上部からクマが大量に落下する演出。",
  init({ context }) {
    const container = document.createElement("div");
    container.className = "bear-rain";
    document.body.appendChild(container);

    const spawn = (count = 1) => {
      for (let i = 0; i < count; i += 1) {
        createBear(container);
      }
    };

    context.setBearSpawner(spawn);
    createInitialBurst(container);

    return () => {
      context.setBearSpawner(null);
      container.remove();
    };
  },
};
