const SCROLL_EASE = 0.08;
const BURST_INTERVAL = 220;

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
      const topHue = 10 + progress * 30;
      const midHue = 260 - progress * 40;
      const bottomHue = 5 + progress * 15;
      const topLight = 96 - progress * 4;
      const midLight = 95 - progress * 5;
      const bottomLight = 100 - progress * 4;
      const scale = 1 + progress * 0.35;
      const speed = 1 + progress * 0.6;

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
        const burst = Math.round(pick(2, 4));
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
