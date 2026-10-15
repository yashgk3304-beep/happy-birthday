import { escapeHTML, paragraph, text } from "../scripts/config.js";

export function renderGiftCard(gift, context, index) {
  const hue = ["rose", "gold", "teal", "peach"][index % 4];

  return `
    <button class="gift-card gift-card-${hue}" type="button" data-gift-id="${text(gift.id, context)}">
      <span class="gift-card-badge" aria-hidden="true">
        <span class="gift-card-badge-icon">🎁</span>
        <span class="gift-card-badge-label">Gift</span>
      </span>
      <span class="gift-box" aria-hidden="true">
        <span class="gift-lid"></span>
        <span class="gift-ribbon-vertical"></span>
        <span class="gift-ribbon-horizontal"></span>
      </span>
      <span class="gift-card-copy">
        <span>${text(gift.closedText, context)}</span>
      </span>
    </button>
  `;
}

export function renderGiftModal(config, context) {
  return `
    <div class="gift-modal" data-gift-modal hidden>
      <div class="gift-modal-backdrop" data-action="close-gift"></div>
      <article class="gift-modal-panel" role="dialog" aria-modal="true" aria-label="Opened gift message">
        <button class="icon-button modal-close" type="button" data-action="close-gift" aria-label="${text(
          config.giftsPage.closeLabel,
          context
        )}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div class="gift-modal-visual" data-gift-visual></div>
        <div class="gift-modal-copy">
          <p data-gift-message></p>
        </div>
      </article>
    </div>
  `;
}

export function getGiftContent(gift, context) {
  return {
    title: text(gift.title, context),
    message: paragraph(gift.message, context),
    image: escapeHTML(gift.image || ""),
    audio: escapeHTML(gift.audio || "")
  };
}
