/*
【ファイル】effects/loader-bearrun.js
【役割】ページ読み込み中にクマが走るローダーを表示する
【触ってOK】表示時間、フェード時間、色、サイズ、速度、文言
【注意】PNG連番に差し替えやすい構造にしている
【関連】script.js / index.html
【確認】/?loader=1 で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 最低表示時間（ms）
const MIN_SHOW_MS = 900;
// フェードアウト時間（ms）
const FADE_OUT_MS = 500;
// 背景色（rgb の3値をカンマ区切り）
const OVERLAY_COLOR = "20, 24, 32";
// 背景の透明度（0〜1）
const OVERLAY_OPACITY = 0.72;
// クマのサイズ（px）
const BEAR_SIZE = 48;
// 走る速度（1往復の時間 ms）
const RUN_DURATION_MS = 1000;
// ループ回数（0 = 無限）
const RUN_LOOP_COUNT = 0;
// ローディング文言
const LOADING_TEXT = "読み込み中…";
// ===== ここから下は基本触らない =====

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .loader-overlay {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(${OVERLAY_COLOR}, ${OVERLAY_OPACITY});
      z-index: 1000;
      pointer-events: all;
      opacity: 1;
      transition: opacity ${FADE_OUT_MS}ms ease;
    }
    .loader-overlay.loader--hide {
      opacity: 0;
    }
    .loader-track {
      width: min(60vw, 360px);
      height: ${BEAR_SIZE * 1.2}px;
      position: relative;
      overflow: hidden;
    }
    .loader-bear {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      font-size: ${BEAR_SIZE}px;
      animation-name: loader-run;
      animation-duration: ${RUN_DURATION_MS}ms;
      animation-timing-function: ease-in-out;
      animation-iteration-count: ${RUN_LOOP_COUNT === 0 ? "infinite" : RUN_LOOP_COUNT};
      animation-direction: alternate;
    }
    .loader-text {
      margin-top: 16px;
      font-size: 14px;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.8);
    }
    @keyframes loader-run {
      0% { transform: translateY(-50%) translateX(0); }
      100% { transform: translateY(-50%) translateX(calc(100% - ${BEAR_SIZE}px)); }
    }
  `;
  document.head.appendChild(style);
  return style;
};

const renderBear = () => {
  const bear = document.createElement("div");
  bear.className = "loader-bear";
  bear.textContent = "🐻";
  return bear;
};

export const loader = {
  id: "loader-bearrun",
  name: "Loader Bear Run",
  description: "ページロード中にクマが走る。",
  init() {
    const styleEl = ensureStyles();
    const overlay = document.createElement("div");
    overlay.className = "loader-overlay";

    const track = document.createElement("div");
    track.className = "loader-track";
    const bear = renderBear();
    track.appendChild(bear);

    const text = document.createElement("div");
    text.className = "loader-text";
    text.textContent = LOADING_TEXT;

    const inner = document.createElement("div");
    inner.style.display = "grid";
    inner.style.placeItems = "center";
    inner.appendChild(track);
    inner.appendChild(text);

    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    const ready =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) =>
            window.addEventListener("load", resolve, { once: true })
          );

    Promise.all([ready, wait(MIN_SHOW_MS)]).then(() => {
      overlay.classList.add("loader--hide");
      setTimeout(() => {
        overlay.remove();
        styleEl.remove();
      }, FADE_OUT_MS);
    });

    return () => {
      overlay.remove();
      styleEl.remove();
    };
  },
};
