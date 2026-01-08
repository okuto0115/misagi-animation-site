const BEAR_COUNT_BASE = 24;
const BEAR_COUNT_MAX = 46;
const BEAR_COUNT_MIN = 14;
const SCROLL_EASE = 0.08;
const BURST_INTERVAL = 220;

const pick = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let bearContainer = null;
let lastBurstTime = 0;
let rafId = null;
const scrollState = {
  current: 0,
  target: 0,
};

const createBear = (container) => {
  const bear = document.createElement("div");
  bear.className = "bear";
  bear.textContent = "🐻";
  const size = Math.round(pick(20, 42));
  const duration = pick(2.8, 5.2);
  const delay = pick(0, 0.8);
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

const createBearRain = () => {
  if (!bearContainer) {
    bearContainer = document.createElement("div");
    bearContainer.className = "bear-rain";
    document.body.appendChild(bearContainer);
  }

  const width = window.innerWidth;
  const base = Math.round(width / 40);
  const count = Math.min(
    BEAR_COUNT_MAX,
    Math.max(BEAR_COUNT_MIN, BEAR_COUNT_BASE + base)
  );

  for (let i = 0; i < count; i += 1) {
    createBear(bearContainer);
  }
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
  document.documentElement.style.setProperty("--bear-scale", scale.toFixed(3));
  document.documentElement.style.setProperty("--bear-speed", speed.toFixed(3));
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
  if (bearContainer && now - lastBurstTime > BURST_INTERVAL) {
    lastBurstTime = now;
    const burst = Math.round(pick(2, 4));
    for (let i = 0; i < burst; i += 1) {
      createBear(bearContainer);
    }
  }

  if (!rafId) {
    rafId = window.requestAnimationFrame(updateScrollEffects);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  applyScrollEffects(0);

  if (!prefersReduced) {
    createBearRain();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
  } else {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
  }

  handleScroll();
});
