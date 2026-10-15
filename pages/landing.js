import { paragraph, text } from "../scripts/config.js";

export function renderLanding(config, context) {
  return `
    <section class="page page-landing is-active" data-page="landing" aria-labelledby="landing-title" aria-hidden="false">
      <div class="landing-veil" aria-hidden="true"></div>
      <div class="hero-shell">
        <div class="hero-copy">
          <h1 id="landing-title">${renderLandingTitle(config, context)}</h1>
          <p>${paragraph(config.landing.subtitle, context)}</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-action="enter">
              <span>${text(config.landing.enterLabel, context)}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div class="hero-art" aria-hidden="true">
          <div class="moon-ring"></div>
          <div class="glass-star star-one"></div>
          <div class="glass-star star-two"></div>
          <div class="wish-thread thread-one"></div>
          <div class="wish-thread thread-two"></div>
        </div>
      </div>
    </section>
  `;
}

function renderLandingTitle(config, context) {
  const template = config.landing.title || "";
  const normalized = template.toLowerCase();

  if (template.includes("{{name}}") && normalized.includes("happy birthday")) {
    return `
      <span>Happy Birthday,</span>
      <span class="name-line">${text(context.name, context)} <span class="title-emoji" aria-hidden="true">🎉</span></span>
    `;
  }

  return text(template, context);
}
