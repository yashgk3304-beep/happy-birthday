import { getGiftContent, renderGiftCard, renderGiftModal } from "../components/giftCard.js";
import { animateIn, sparkleBurst } from "../scripts/effects.js";
import { paragraph, text } from "../scripts/config.js";

export function renderGifts(config, context) {
  const gift = (config.gifts || [])[0];

  return `
    <section class="page page-gifts" data-page="gifts" aria-label="Gift page" aria-hidden="true">
      <div class="gifts-layout">
        <header class="gifts-heading">
          <h1 class="page-title">${text(config.giftsPage.title, context)}</h1>
          <p class="page-subtitle">${paragraph(config.giftsPage.subtitle, context)}</p>
          <p class="gift-for-line">Gift for <strong>${text(context.name, context)}</strong></p>
        </header>
        <div class="gift-grid single-gift-grid" data-gift-grid>
          ${gift ? renderGiftCard(gift, context, 0) : ""}
        </div>
      </div>

      ${renderGiftModal(config, context)}
    </section>
  `;
}

export class GiftsController {
  constructor({ root, config, context, celebration }) {
    this.root = root;
    this.config = config;
    this.context = context;
    this.celebration = celebration;
    this.currentMemory = 0;
  }

  openGift(id) {
    const gift = (this.config.gifts || []).find((item) => item.id === id);
    if (!gift) return;

    const modal = this.root.querySelector("[data-gift-modal]");
    const card = this.root.querySelector(`[data-gift-id="${escapeSelector(id)}"]`);
    const visual = this.root.querySelector("[data-gift-visual]");
    const message = this.root.querySelector("[data-gift-message]");
    const content = getGiftContent(gift, this.context);

    card?.classList.add("is-open");
    message.innerHTML = content.message;
    visual.innerHTML = content.image
      ? `<img src="${content.image}" alt="" />`
      : `<span class="gift-reveal-mark" aria-hidden="true"></span>`;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-visible"));
    sparkleBurst(card, 18);
    sparkleBurst(modal.querySelector(".gift-modal-panel"), 28);
    this.celebration.burst({
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.34,
      count: 70,
      spread: 0.62
    });

    if (content.audio) {
      const audio = new Audio(content.audio);
      audio.volume = 0.55;
      audio.play().catch(() => {});
    }

    animateIn(".gift-modal-panel", { duration: 0.72 });
  }

  closeGift() {
    const modal = this.root.querySelector("[data-gift-modal]");
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-visible");
    window.setTimeout(() => {
      modal.hidden = true;
    }, 260);
  }

  showMemory(direction) {
    const slides = Array.from(this.root.querySelectorAll("[data-memory-slide]"));
    if (!slides.length) return;

    slides[this.currentMemory]?.classList.remove("is-current");
    this.currentMemory =
      direction === "next"
        ? (this.currentMemory + 1) % slides.length
        : (this.currentMemory - 1 + slides.length) % slides.length;
    slides[this.currentMemory]?.classList.add("is-current");
    animateIn(slides[this.currentMemory], { duration: 0.5 });
  }
}

function escapeSelector(value) {
  if (window.CSS?.escape) {
    return CSS.escape(value);
  }

  return String(value).replace(/["\\]/g, "\\$&");
}
