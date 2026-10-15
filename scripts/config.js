const FALLBACK_MESSAGES = {
  defaultName: "Someone Wonderful",
  seo: {
    title: "A Birthday Wish for {{name}}",
    description: "A personalized cinematic birthday experience for {{name}}."
  },
  landing: {
    title: "Happy Birthday, {{name}} 🎉",
    subtitle: "Step into a quiet little celebration made just for you.",
    enterLabel: "Enter",
    musicLabel: "Sound"
  },
  candles: {
    title: "Blow The Candles",
    subtitle: "A quiet wish is waiting in the glow, {{name}}.",
    introMessage: "Wish you a happy birthday, {{name}}. Blow the candles.",
    firstCountdownLabel: "Blow the candles",
    secondCountdownLabel: "Blow hard again",
    listeningLabel: "Blow!",
    firstBlowMessage: "Blow harder again!",
    missedBlowMessage: "The flames are still listening...",
    successMessage: "The wish is free.",
    microphoneMessage: "Please allow microphone access so the candles can hear your blow.",
    useMicrophone: true
  },
  giftsPage: {
    title: "A Few Little Gifts",
    subtitle: "{{name}}, open them in any order.",
    closeLabel: "Close",
    memoryTitle: "Memory Reel"
  },
  gifts: [
    {
      id: "letter",
      title: "A Letter",
      closedText: "For the moments you made lighter",
      message: "{{name}}, may this year meet you gently and surprise you beautifully.",
      image: "",
      audio: ""
    }
  ],
  memories: [],
  assets: {
    backgroundMusic: "",
    successAudio: ""
  }
};

export async function loadMessages() {
  try {
    const response = await fetch("./messages/messages.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`messages.json returned ${response.status}`);
    }

    const data = await response.json();
    return deepMerge(FALLBACK_MESSAGES, data);
  } catch (error) {
    console.warn("Using fallback birthday messages.", error);
    return FALLBACK_MESSAGES;
  }
}

export function getGuestName(config) {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("name");
  return cleanName(fromUrl || config.defaultName || FALLBACK_MESSAGES.defaultName);
}

export function personalize(value, context) {
  return String(value || "").replace(/\{\{\s*name\s*\}\}/gi, context.name);
}

export function text(value, context) {
  return escapeHTML(personalize(value, context));
}

export function paragraph(value, context) {
  return text(value, context).replace(/\n/g, "<br />");
}

export function setDocumentMeta(config, context) {
  const seoTitle = personalize(config.seo?.title || FALLBACK_MESSAGES.seo.title, context);
  const seoDescription = personalize(
    config.seo?.description || FALLBACK_MESSAGES.seo.description,
    context
  );

  document.title = seoTitle;
  setMeta("description", seoDescription);
  setProperty("og:title", seoTitle);
  setProperty("og:description", seoDescription);
}

export function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanName(value) {
  return String(value || "")
    .trim()
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 42);
}

function setMeta(name, content) {
  const meta = document.querySelector(`meta[name="${name}"]`);
  if (meta) {
    meta.setAttribute("content", content);
  }
}

function setProperty(property, content) {
  const meta = document.querySelector(`meta[property="${property}"]`);
  if (meta) {
    meta.setAttribute("content", content);
  }
}

function deepMerge(base, override) {
  if (Array.isArray(base)) {
    return Array.isArray(override) ? override : base;
  }

  if (!isObject(base) || !isObject(override)) {
    return override === undefined ? base : override;
  }

  const merged = { ...base };
  for (const key of Object.keys(override)) {
    merged[key] = deepMerge(base[key], override[key]);
  }

  return merged;
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}
