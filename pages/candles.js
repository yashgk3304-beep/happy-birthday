import { animateIn, sparkleBurst } from "../scripts/effects.js";
import { paragraph, personalize, text } from "../scripts/config.js";

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function renderCandles(config, context) {
  return `
    <section class="page page-candles" data-page="candles" aria-labelledby="candles-title" aria-hidden="true">
      <div class="cinema-frame" aria-hidden="true"></div>
      <div class="candles-layout">
        <header class="page-heading">
          <h1 id="candles-title">${text(config.candles.title, context)}</h1>
          <p data-candle-status>${paragraph(config.candles.subtitle, context)}</p>
        </header>

        ${renderCake()}
      </div>

      <div class="countdown" data-countdown aria-live="assertive" aria-atomic="true"></div>
      <div class="floating-message" data-candle-message role="status"></div>
    </section>
  `;
}

export class CandlesController {
  constructor({ root, config, context, celebration, audio, onComplete }) {
    this.root = root;
    this.config = config;
    this.context = context;
    this.celebration = celebration;
    this.audio = audio;
    this.onComplete = onComplete;
    this.attempt = 0;
    this.active = false;
  }

  get page() {
    return this.root.querySelector('[data-page="candles"]');
  }

  get cake() {
    return this.root.querySelector("[data-cake-stage]");
  }

  get status() {
    return this.root.querySelector("[data-candle-status]");
  }

  get countdown() {
    return this.root.querySelector("[data-countdown]");
  }

  get message() {
    return this.root.querySelector("[data-candle-message]");
  }

  async start() {
    if (this.active) return;
    this.active = true;
    this.attempt = 0;
    this.status.innerHTML = paragraph(this.config.candles.subtitle, this.context);
    this.showMessage(this.config.candles.introMessage);
    await delay(1100);

    await delay(350);
    await this.runAttempt({ seconds: 5, hard: false });
  }

  async runAttempt({ seconds, hard }) {
    this.clearMessage();
    this.status.textContent = personalize(
      hard ? this.config.candles.secondCountdownLabel : this.config.candles.firstCountdownLabel,
      this.context
    );
    this.cake.classList.add("listening");

    await this.runCountdown({ seconds });
    this.cake.classList.remove("listening", "pressure-mid", "pressure-high", "air-passing");

    if (!hard) {
      this.attempt = 1;
      this.cake.classList.add("weak-blow", "air-passing", "blow-weak");
      sparkleBurst(this.cake, 12);
      await delay(1050);
      this.cake.classList.remove("blow-weak");
      this.showMessage(this.config.candles.firstBlowMessage);
      await delay(1600);
      this.cake.classList.remove("weak-blow", "air-passing", "pressure-high");
      return this.runAttempt({ seconds: 4, hard: true });
    }

    this.cake.classList.add("air-passing", "pressure-high", "blow-strong");
    sparkleBurst(this.cake, 26);
    await delay(1050);
    this.cake.classList.remove("blow-strong");

    await this.complete();
  }

  async complete() {
    this.status.textContent = personalize(this.config.candles.successMessage, this.context);
    this.cake.classList.add("candles-out");
    this.showMessage(this.config.candles.successMessage);
    this.celebration.burst({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.46,
      count: 220,
      spread: 1.18
    });
    sparkleBurst(this.cake, 38);
    await this.audio.playSuccess();

    await delay(1100);
    this.onComplete?.();
  }

  async runCountdown({ seconds }) {
    const countdown = this.countdown;
    if (!countdown) {
      await delay(seconds * 1000);
      this.status.textContent = "";
      return;
    }

    countdown.classList.add("is-visible");

    for (let item = seconds; item >= 1; item -= 1) {
      countdown.textContent = String(item);
      animateCountdown(countdown);
      await delay(1000);
    }

    countdown.classList.remove("is-visible");
    countdown.textContent = "";
    this.status.textContent = "";
  }

  showMessage(value) {
    this.message.textContent = personalize(value, this.context);
    this.message.classList.add("is-visible");
    animateIn(this.message, { duration: 0.5 });
  }

  clearMessage() {
    this.message.classList.remove("is-visible");
    this.message.textContent = "";
  }
}

function renderCake() {
  const candles = Array.from({ length: 5 })
    .map(
      (_, index) => `
        <span class="candle candle-${index + 1}">
          <span class="wick"></span>
          <span class="flame"></span>
        </span>
      `
    )
    .join("");

  return `
    <div class="cake-stage" data-cake-stage>
      <div class="cake-aura"></div>
      <div class="candles" aria-hidden="true">${candles}</div>
      <div class="cake-body" aria-hidden="true">
        <div class="knife-light"></div>
        <div class="cake-half cake-half-left">
          <span class="frosting frosting-left"></span>
          <span class="cake-layer layer-top"></span>
          <span class="cake-layer layer-bottom"></span>
        </div>
        <div class="cake-half cake-half-right">
          <span class="frosting frosting-right"></span>
          <span class="cake-layer layer-top"></span>
          <span class="cake-layer layer-bottom"></span>
        </div>
      </div>
      <div class="cake-plate"></div>
    </div>
  `;
}

function animateCountdown(element) {
  const gsap = window.gsap;
  if (!gsap) return;

  gsap.fromTo(
    element,
    { scale: 0.72, autoAlpha: 0, filter: "blur(14px)" },
    { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.42, ease: "power3.out" }
  );
}

