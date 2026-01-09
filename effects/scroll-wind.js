/*
【ファイル】effects/scroll-wind.js
【役割】スクロール速度で風の粒子が流れる演出
【触ってOK】粒子数、強さ、サイズ、透明度、方向、寿命
【注意】Canvasで描画。重くならない設定推奨
【関連】effects/registry.js / style.css
【確認】/?fx=scroll-wind で動作確認
*/
// ===== 調整パラメータ（ここだけ触ってOK）=====
// 粒子の最大数（多いほど派手だが重くなる）
const PARTICLE_MAX = 140;
// 風の強さ倍率（スクロール速度→風速変換）
const WIND_STRENGTH = 0.018;
// 粒子の最小サイズ（px）
const PARTICLE_SIZE_MIN = 1;
// 粒子の最大サイズ（px）
const PARTICLE_SIZE_MAX = 3;
// 粒子の最小透明度（0〜1）
const PARTICLE_ALPHA_MIN = 0.08;
// 粒子の最大透明度（0〜1）
const PARTICLE_ALPHA_MAX = 0.35;
// 風の方向（1: 左→右, -1: 右→左）
const WIND_DIRECTION = 1;
// 粒子の寿命（秒）
const PARTICLE_LIFE = 2.8;
// 追従のなめらかさ（小さいほどゆっくり）
const VELOCITY_EASE = 0.1;
// 速度がほぼゼロとみなす閾値
const SPEED_EPSILON = 0.002;
// ===== ここから下は基本触らない =====

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const pick = (min, max) => Math.random() * (max - min) + min;

export const effect = {
  id: "scroll-wind",
  name: "Scroll Wind",
  description: "スクロール速度で風（粒子）が流れる。",
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
      zIndex: "6",
    });
    document.body.appendChild(canvas);

    let width = 0;
    let height = 0;
    const particles = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * window.devicePixelRatio);
      canvas.height = Math.floor(height * window.devicePixelRatio);
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const spawnParticle = (speedFactor) => {
      const size = pick(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX);
      const alpha = pick(PARTICLE_ALPHA_MIN, PARTICLE_ALPHA_MAX);
      const life = PARTICLE_LIFE * 1000;
      particles.push({
        x: WIND_DIRECTION > 0 ? -size : width + size,
        y: pick(0, height),
        vx: speedFactor * WIND_DIRECTION,
        vy: pick(-0.15, 0.15),
        size,
        alpha,
        life,
        born: performance.now(),
      });
    };

    let rafId = null;
    let targetSpeed = 0;
    let currentSpeed = 0;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();

    const update = () => {
      const now = performance.now();
      const dt = Math.min(64, now - lastTime);
      lastTime = now;

      const diff = targetSpeed - currentSpeed;
      currentSpeed += diff * VELOCITY_EASE;

      const speedFactor = Math.abs(currentSpeed) * WIND_STRENGTH * width;
      const activeCount = Math.min(
        PARTICLE_MAX,
        Math.round(clamp(speedFactor * 0.18, 0, PARTICLE_MAX))
      );

      while (particles.length < activeCount) {
        spawnParticle(speedFactor || 0.2);
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        const age = now - p.born;
        if (age > p.life) {
          particles.splice(i, 1);
          continue;
        }

        const lifeRatio = age / p.life;
        const fade = lifeRatio < 0.2 ? lifeRatio / 0.2 : 1 - (lifeRatio - 0.2) / 0.8;
        const alpha = p.alpha * clamp(fade, 0, 1);
        const speed = speedFactor || 0.4;
        p.x += speed * (dt / 16) * WIND_DIRECTION;
        p.y += p.vy * dt;

        if (p.x < -10 || p.x > width + 10) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 2, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (Math.abs(currentSpeed) > SPEED_EPSILON || particles.length > 0) {
        rafId = window.requestAnimationFrame(update);
      } else {
        rafId = null;
      }
    };

    const handleScroll = () => {
      const now = performance.now();
      const delta = window.scrollY - lastScrollY;
      const dt = Math.max(16, now - lastTime);
      lastScrollY = window.scrollY;
      targetSpeed = delta / dt;
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    resize();
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
