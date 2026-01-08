const BEAR_COUNT_BASE = 24;
const BEAR_COUNT_MAX = 46;
const BEAR_COUNT_MIN = 14;

const pick = (min, max) => Math.random() * (max - min) + min;

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

const createInitialBurst = (container) => {
  const width = window.innerWidth;
  const base = Math.round(width / 40);
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
