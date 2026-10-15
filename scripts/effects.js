const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initAmbientCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationId = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    seedParticles(particles, Math.min(120, Math.floor((width * height) / 10500)));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255, 205, 132, 0.05)");
    gradient.addColorStop(0.45, "rgba(255, 124, 154, 0.04)");
    gradient.addColorStop(1, "rgba(115, 247, 220, 0.035)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.phase += particle.speed;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;

      const pulse = 0.45 + Math.sin(particle.phase) * 0.28;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha * pulse})`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reducedMotion) {
      animationId = requestAnimationFrame(draw);
    }
  };

  resize();
  draw();
  window.addEventListener("resize", resize);

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
  };
}

export function createCelebrationCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const confetti = [];
  let width = 0;
  let height = 0;
  let animationId = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const tick = () => {
    ctx.clearRect(0, 0, width, height);

    for (let index = confetti.length - 1; index >= 0; index -= 1) {
      const item = confetti[index];
      item.x += item.vx;
      item.y += item.vy;
      item.vy += item.gravity;
      item.rotation += item.spin;
      item.life -= 1;
      item.alpha = Math.max(item.life / item.maxLife, 0);

      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.globalAlpha = item.alpha;
      ctx.fillStyle = item.color;
      ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.restore();

      if (item.life <= 0 || item.y > height + 40) {
        confetti.splice(index, 1);
      }
    }

    if (confetti.length) {
      animationId = requestAnimationFrame(tick);
    } else {
      animationId = 0;
    }
  };

  resize();
  window.addEventListener("resize", resize);

  return {
    burst({ x = width / 2, y = height * 0.42, count = 170, spread = 1 } = {}) {
      if (reducedMotion) return;
      const colors = ["#fff1bc", "#ffb285", "#ff6f91", "#7af5dd", "#ffffff"];
      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * spread;
        const velocity = 5 + Math.random() * 10;
        confetti.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          gravity: 0.13 + Math.random() * 0.07,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.28,
          width: 5 + Math.random() * 8,
          height: 8 + Math.random() * 14,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 90 + Math.random() * 70,
          maxLife: 150,
          alpha: 1
        });
      }

      if (!animationId) tick();
    },
    destroy() {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    }
  };
}

export function sparkleBurst(container, amount = 24) {
  if (reducedMotion || !container) return;

  for (let i = 0; i < amount; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.setProperty("--x", `${(Math.random() - 0.5) * 240}px`);
    sparkle.style.setProperty("--y", `${(Math.random() - 0.5) * 180}px`);
    sparkle.style.setProperty("--delay", `${Math.random() * 180}ms`);
    container.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 1200);
  }
}

export class ExperienceAudio {
  constructor(config = {}) {
    this.config = config;
    this.context = null;
    this.oscillators = [];
    this.media = null;
    this.playing = false;
  }

  async toggle() {
    if (this.playing) {
      this.stop();
      return false;
    }

    await this.start();
    return true;
  }

  async start() {
    if (this.config.backgroundMusic) {
      this.media = this.media || new Audio(this.config.backgroundMusic);
      this.media.loop = true;
      this.media.volume = 0.42;
      await this.media.play();
      this.playing = true;
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = this.context || new AudioContextClass();
    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    const master = this.context.createGain();
    master.gain.setValueAtTime(0.0001, this.context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, this.context.currentTime + 1.2);
    master.connect(this.context.destination);

    this.oscillators = [196, 246.94, 329.63].map((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 1 ? 0.16 : 0.12;
      oscillator.connect(gain).connect(master);
      oscillator.start();
      return { oscillator, gain, master };
    });
    this.playing = true;
  }

  stop() {
    if (this.media) {
      this.media.pause();
      this.media.currentTime = 0;
    }

    this.oscillators.forEach(({ oscillator, gain }) => {
      try {
        gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.2);
        oscillator.stop(this.context.currentTime + 0.25);
      } catch {
        // Oscillators can only be stopped once.
      }
    });
    this.oscillators = [];
    this.playing = false;
  }

  async playSuccess() {
    if (this.config.successAudio) {
      const audio = new Audio(this.config.successAudio);
      audio.volume = 0.62;
      await audio.play().catch(() => {});
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = this.context || new AudioContextClass();
    this.context = context;
    if (context.state === "suspended") {
      await context.resume();
    }

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.08 + 0.55);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * 0.08);
      oscillator.stop(context.currentTime + index * 0.08 + 0.62);
    });
  }
}

export function animateIn(selector, options = {}) {
  const gsap = window.gsap;
  if (!gsap || reducedMotion) return;

  gsap.fromTo(
    selector,
    { autoAlpha: 0, y: 26, filter: "blur(12px)" },
    {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      duration: options.duration || 1.1,
      stagger: options.stagger || 0.08,
      ease: "power3.out",
      delay: options.delay || 0
    }
  );
}

function seedParticles(particles, count) {
  particles.length = 0;
  const colors = ["255, 224, 163", "255, 141, 155", "126, 247, 220", "255, 255, 255"];

  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.05 - Math.random() * 0.18,
      radius: 0.8 + Math.random() * 2.4,
      alpha: 0.18 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.025,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}
