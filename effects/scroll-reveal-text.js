/*
【ファイル】effects/scroll-reveal-text.js
【役割】スクロールでテキストがふわっと浮かび上がる
【触ってOK】対象セレクタ、しきい値、時間、距離、ぼかし、遅延
【注意】IntersectionObserverで軽量。必要時だけ動く
【関連】effects/registry.js / style.css
【確認】/?fx=scroll-reveal-text で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 対象セレクタ（このクラスが付いた要素が対象）
const TARGET_SELECTOR = ".reveal";
// 発火しきい値（画面のどのくらい入ったら開始するか）
const REVEAL_THRESHOLD = 0.3;
// アニメ時間（ms）
const REVEAL_DURATION = 700;
// 上に動く距離（px）
const REVEAL_DISTANCE = 24;
// 初期ぼかし量（px）
const REVEAL_BLUR = 6;
// イージング（CSSの easing 文字列）
const REVEAL_EASING = "cubic-bezier(0.2, 0.6, 0.2, 1)";
// 1要素ごとの遅延（ms）
const STAGGER_DELAY = 80;
// 一度表示したら再発火しない
const REVEAL_ONCE = true;
// ===== ここから下は基本触らない =====

export const effect = {
  id: "scroll-reveal-text",
  name: "Scroll Reveal Text",
  description: "スクロールで文字がふわっと浮かび上がる。",
  init() {
    const targets = Array.from(document.querySelectorAll(TARGET_SELECTOR));
    if (!targets.length) {
      return () => {};
    }

    targets.forEach((el, index) => {
      el.style.setProperty("--reveal-distance", `${REVEAL_DISTANCE}px`);
      el.style.setProperty("--reveal-blur", `${REVEAL_BLUR}px`);
      el.style.transitionDuration = `${REVEAL_DURATION}ms`;
      el.style.transitionTimingFunction = REVEAL_EASING;
      el.style.transitionDelay = `${index * STAGGER_DELAY}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--in");
            if (REVEAL_ONCE) {
              observer.unobserve(entry.target);
            }
          } else if (!REVEAL_ONCE) {
            entry.target.classList.remove("reveal--in");
          }
        });
      },
      {
        threshold: REVEAL_THRESHOLD,
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      targets.forEach((el) => {
        el.classList.remove("reveal--in");
        el.style.removeProperty("--reveal-distance");
        el.style.removeProperty("--reveal-blur");
        el.style.transitionDuration = "";
        el.style.transitionTimingFunction = "";
        el.style.transitionDelay = "";
      });
    };
  },
};
