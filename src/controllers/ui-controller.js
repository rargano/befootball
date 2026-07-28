const FONT_KEY = "befootball-font-scale";
const LANG_KEY = "befootball-news-language";

const fontSizes = [
  { label: "A-", value: "0.92" },
  { label: "A", value: "1" },
  { label: "A+", value: "1.12" },
];

const languages = [
  { label: "ไทย", value: "th" },
  { label: "ต้นฉบับ", value: "original" },
];

function currentFontScale() {
  return localStorage.getItem(FONT_KEY) ?? "1";
}

function currentLanguage() {
  return localStorage.getItem(LANG_KEY) ?? "th";
}

function applyFontScale(value) {
  document.documentElement.style.setProperty("--font-scale", value);
  localStorage.setItem(FONT_KEY, value);
}

function applyLanguage(value) {
  localStorage.setItem(LANG_KEY, value);
  window.dispatchEvent(new CustomEvent("befootball:language-change", { detail: { language: value } }));
}

function buildSegmentedControl(items, activeValue, onSelect) {
  const group = document.createElement("div");
  group.className = "segmented-control";

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.dataset.value = item.value;
    button.className = item.value === activeValue ? "active" : "";
    button.addEventListener("click", () => {
      group.querySelectorAll("button").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      onSelect(item.value);
    });
    group.append(button);
  });

  return group;
}

function mountToolbar() {
  const masthead = document.querySelector(".masthead");
  if (!masthead || document.querySelector(".site-tools")) return;

  const toolbar = document.createElement("div");
  toolbar.className = "site-tools";

  const fontGroup = document.createElement("div");
  fontGroup.className = "tool-group";
  fontGroup.append(buildSegmentedControl(fontSizes, currentFontScale(), applyFontScale));

  const languageGroup = document.createElement("div");
  languageGroup.className = "tool-group language-tool";
  languageGroup.append(buildSegmentedControl(languages, currentLanguage(), applyLanguage));

  toolbar.append(fontGroup, languageGroup);

  const adminLink = masthead.querySelector(".admin-zone-link");
  if (adminLink) {
    masthead.insertBefore(toolbar, adminLink);
  } else {
    masthead.append(toolbar);
  }
}

function updateDateLabel() {
  const dateLabel = document.querySelector(".utility-inner > span");
  if (!dateLabel) return;

  dateLabel.textContent = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

applyFontScale(currentFontScale());
updateDateLabel();
mountToolbar();
