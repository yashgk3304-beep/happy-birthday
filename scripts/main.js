import { getGuestName, loadMessages, setDocumentMeta } from "./config.js";
import {
  ExperienceAudio,
  animateIn,
  createCelebrationCanvas,
  initAmbientCanvas
} from "./effects.js";
import { renderLanding } from "../pages/landing.js";
import { CandlesController, renderCandles } from "../pages/candles.js";
import { GiftsController, renderGifts } from "../pages/gifts.js";

const app = document.getElementById("app");
const ambientCanvas = document.getElementById("ambient-canvas");
const celebrationCanvas = document.getElementById("celebration-canvas");

const state = {
  page: "landing",
  config: null,
  context: null,
  celebration: null,
  audio: null,
  candles: null,
  gifts: null
};

boot();

async function boot() {
  state.config = await loadMessages();
  state.context = { name: getGuestName(state.config) };
  setDocumentMeta(state.config, state.context);

  state.celebration = createCelebrationCanvas(celebrationCanvas);
  state.audio = new ExperienceAudio(state.config.assets);
  initAmbientCanvas(ambientCanvas);

  app.innerHTML = `
    ${renderLanding(state.config, state.context)}
    ${renderCandles(state.config, state.context)}
    ${renderGifts(state.config, state.context)}
    <div class="page-transition" aria-hidden="true"></div>
  `;

  state.candles = new CandlesController({
    root: app,
    config: state.config,
    context: state.context,
    celebration: state.celebration,
    audio: state.audio,
    onComplete: () => showPage("gifts")
  });

  state.gifts = new GiftsController({
    root: app,
    config: state.config,
    context: state.context,
    celebration: state.celebration
  });

  bindEvents();
  animateIn(".page-landing .hero-copy > *", { delay: 0.18, duration: 1.15, stagger: 0.12 });
  animateIn(".page-landing .hero-art > *", { delay: 0.36, duration: 1.3, stagger: 0.1 });
}

function bindEvents() {
  app.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    const giftButton = event.target.closest("[data-gift-id]");

    if (giftButton) {
      state.gifts.openGift(giftButton.dataset.giftId);
      return;
    }

    if (!action) return;

    if (action === "enter") {
      await showPage("candles");
      animateIn(".page-candles .page-heading > *, .cake-stage", {
        duration: 0.9,
        stagger: 0.09
      });
      state.candles.start();
    }

    if (action === "toggle-sound") {
      const isPlaying = await state.audio.toggle().catch(() => false);
      const button = event.target.closest("[data-action='toggle-sound']");
      button?.setAttribute("aria-pressed", String(isPlaying));
      button?.classList.toggle("is-on", isPlaying);
    }

    if (action === "close-gift") {
      state.gifts.closeGift();
    }

    if (action === "memory-next") {
      state.gifts.showMemory("next");
    }

    if (action === "memory-prev") {
      state.gifts.showMemory("prev");
    }
  });

  window.addEventListener("keydown", async (event) => {
    if (event.key === "Escape") {
      state.gifts?.closeGift();
    }

    if (state.page === "landing" && event.key === "Enter") {
      await showPage("candles");
      animateIn(".page-candles .page-heading > *, .cake-stage", {
        duration: 0.9,
        stagger: 0.09
      });
      state.candles.start();
    }

  });
}

async function showPage(nextPage) {
  if (state.page === nextPage) return;

  const current = app.querySelector(`[data-page="${state.page}"]`);
  const next = app.querySelector(`[data-page="${nextPage}"]`);
  const veil = app.querySelector(".page-transition");
  state.page = nextPage;

  if (window.gsap) {
    const timeline = window.gsap.timeline();
    timeline
      .to(veil, { autoAlpha: 1, duration: 0.42, ease: "power2.inOut" })
      .to(current, { autoAlpha: 0, y: -24, duration: 0.42, ease: "power3.in" }, "-=0.18")
      .add(() => {
        current?.classList.remove("is-active");
        current?.setAttribute("aria-hidden", "true");
        next?.classList.add("is-active");
        next?.setAttribute("aria-hidden", "false");
        window.scrollTo({ top: 0, behavior: "auto" });
      })
      .fromTo(next, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.62, ease: "power3.out" })
      .to(veil, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, "-=0.35");

    await new Promise((resolve) => timeline.eventCallback("onComplete", resolve));
    if (nextPage === "gifts") {
      animateIn(".page-gifts .page-heading > *, .gift-card, .memory-reel", {
        duration: 0.8,
        stagger: 0.07
      });
    }
    return;
  }

  current?.classList.remove("is-active");
  current?.setAttribute("aria-hidden", "true");
  next?.classList.add("is-active");
  next?.setAttribute("aria-hidden", "false");
}
