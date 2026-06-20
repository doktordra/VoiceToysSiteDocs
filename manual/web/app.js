const LANGUAGE_KEY = "voice-toys-doc-language";
const HOME_PAGE = "OPS/page-1.xhtml";
const TOC_PAGE = "OPS/toc.xhtml";
const OPF_PAGE_ORDER = "OPS/epb.opf";
const LANGUAGES_MANIFEST = "data/languages.json";
const EPUB_REVISION = "20260604";

const ui = {
  appTitle: document.getElementById("app-title"),
  langLabel: document.getElementById("lang-label"),
  langToggle: document.getElementById("lang-toggle"),
  languageDialog: document.getElementById("language-dialog"),
  languageDialogTitle: document.getElementById("language-dialog-title"),
  languageDialogHint: document.getElementById("language-dialog-hint"),
  languageDialogClose: document.getElementById("language-dialog-close"),
  languageOptions: document.getElementById("language-options"),
  tocTitle: document.getElementById("toc-title"),
  tocHint: document.getElementById("toc-hint"),
  tocList: document.getElementById("toc-list"),
  viewer: document.getElementById("viewer"),
  homePage: document.getElementById("home-page"),
  prevPage: document.getElementById("prev-page"),
  nextPage: document.getElementById("next-page"),
  pageCounter: document.getElementById("page-counter"),
  exportPdf: document.getElementById("export-pdf")
};

let language = "sr";
let dictionary = {};
let tocEntries = [];
let pageSequence = [];
let currentPageIndex = 0;
let contentByLanguage = {};
let fallbackByLanguage = {};
let languagesConfig = {
  defaultLanguage: "sr",
  languages: []
};

const LANGUAGE_FLAGS = {
  sr: "🇷🇸",
  en: "🇬🇧",
  de: "🇩🇪"
};

function withRevision(path) {
  const joiner = path.includes("?") ? "&" : "?";
  return `${path}${joiner}rev=${EPUB_REVISION}`;
}

function pageLabelTemplate() {
  return dictionary.app.pageCounter || "Strana {current} / {total}";
}

function normalizePath(path) {
  return path.replace(/^OPS\//, "").replace(/\?.*$/, "");
}

function pageCounterText() {
  const total = pageSequence.length || 1;
  const current = Math.min(currentPageIndex + 1, total);
  return pageLabelTemplate()
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

function setText(node, value) {
  if (node) {
    node.textContent = value;
  }
}

function updatePagerUi() {
  const hasPages = pageSequence.length > 0;
  if (ui.prevPage) {
    ui.prevPage.disabled = !hasPages || currentPageIndex <= 0;
  }

  if (ui.nextPage) {
    ui.nextPage.disabled = !hasPages || currentPageIndex >= pageSequence.length - 1;
  }

  setText(ui.pageCounter, pageCounterText());
}

function setCurrentPageIndexByPath(path) {
  const normalized = normalizePath(path);
  const index = pageSequence.findIndex((item) => normalizePath(item) === normalized);
  if (index >= 0) {
    currentPageIndex = index;
  }
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Ne mogu da učitam ${path}`);
  }

  return response.json();
}

function normalizeLanguageCode(value) {
  return String(value || "").trim().toLowerCase();
}

function languageFlag(code) {
  return LANGUAGE_FLAGS[normalizeLanguageCode(code)] || "🌐";
}

function flaggedLabel(code, label) {
  return `<span class="flag" aria-hidden="true">${languageFlag(code)}</span> <span>${label}</span>`;
}

function availableLanguages() {
  if (!Array.isArray(languagesConfig.languages)) {
    return [];
  }

  return languagesConfig.languages.filter((item) => item && normalizeLanguageCode(item.code).length > 0);
}

function getLanguageConfig(code) {
  const normalized = normalizeLanguageCode(code);
  return availableLanguages().find((item) => normalizeLanguageCode(item.code) === normalized) || null;
}

function defaultLanguageCode() {
  const configured = normalizeLanguageCode(languagesConfig.defaultLanguage);
  if (configured && getLanguageConfig(configured)) {
    return configured;
  }

  const first = availableLanguages()[0];
  return normalizeLanguageCode(first?.code) || "sr";
}

function resolveInitialLanguage() {
  const stored = normalizeLanguageCode(localStorage.getItem(LANGUAGE_KEY));
  if (stored && getLanguageConfig(stored)) {
    return stored;
  }

  return defaultLanguageCode();
}

async function loadLanguagesManifest() {
  languagesConfig = await loadJson(LANGUAGES_MANIFEST);
  language = resolveInitialLanguage();
}

async function loadLanguage(lang) {
  const config = getLanguageConfig(lang);
  if (!config?.ui) {
    throw new Error(`UI prevod nije definisan za jezik: ${lang}`);
  }

  dictionary = await loadJson(config.ui);
}

async function loadContentForLanguage(lang) {
  if (Object.prototype.hasOwnProperty.call(contentByLanguage, lang)) {
    return;
  }

  const config = getLanguageConfig(lang);
  if (!config?.content) {
    contentByLanguage[lang] = null;
    return;
  }

  try {
    contentByLanguage[lang] = await loadJson(config.content);
  } catch (error) {
    console.warn(`Content file not available for ${lang}: ${config.content}`);
    contentByLanguage[lang] = null;
  }
}

async function loadFallbackForLanguage(lang) {
  if (Object.prototype.hasOwnProperty.call(fallbackByLanguage, lang)) {
    return;
  }

  const config = getLanguageConfig(lang);
  if (!config?.fallback) {
    fallbackByLanguage[lang] = null;
    return;
  }

  try {
    const payload = await loadJson(config.fallback);
    fallbackByLanguage[lang] = payload?.map || null;
  } catch (error) {
    console.warn(`Fallback dictionary not available for ${lang}: ${config.fallback}`);
    fallbackByLanguage[lang] = null;
  }
}

function extractNodeText(node) {
  if (node.nodeType === 3) {
    return node.textContent;
  }
  let text = "";
  for (const child of node.childNodes) {
    if (child.nodeType === 3) {
      text += child.textContent;
    } else if (child.nodeType === 1) {
      if (/^(SCRIPT|STYLE)$/i.test(child.tagName)) continue;
      text += " " + extractNodeText(child) + " ";
    }
  }
  return text;
}

function cleanText(input) {
  return (input || "").replace(/\s+/g, " ").trim();
}

function currentPagePath() {
  const src = ui.viewer.getAttribute("src") || "";
  return src.replace(/\?.*$/, "");
}

function printCurrentPage() {
  const frameWindow = ui.viewer?.contentWindow;
  if (!frameWindow) {
    return;
  }

  frameWindow.focus();
  frameWindow.print();
}

async function buildFullDocumentPrintHtml() {
  const parser = new DOMParser();
  const pages = [];

  for (const path of pageSequence) {
    const response = await fetch(withRevision(path));
    if (!response.ok) {
      continue;
    }

    const source = await response.text();
    const pageDoc = parser.parseFromString(source, "application/xhtml+xml");
    const pageBody = pageDoc.querySelector("body");
    if (!pageBody) {
      continue;
    }

    pages.push(`<section class="print-page">${pageBody.innerHTML}</section>`);
  }

  const baseHref = new URL("OPS/", window.location.href).href;
  const docLang = language || "sr";

  return `<!doctype html>
<html lang="${docLang}">
  <head>
    <meta charset="UTF-8" />
    <base href="${baseHref}" />
    <link rel="stylesheet" href="css/book.css" />
    <style>
      @page {
        size: 1024px 768px;
        margin: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
      .print-page {
        position: relative;
        width: 1024px;
        height: 768px;
        overflow: hidden;
        break-after: page;
        page-break-after: always;
      }
      .print-page:last-child {
        break-after: auto;
        page-break-after: auto;
      }
    </style>
  </head>
  <body>
    ${pages.join("\n")}
  </body>
</html>`;
}

async function exportCurrentPagePdf() {
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Browser je blokirao novi prozor za PDF export.");
    return;
  }

  const html = await buildFullDocumentPrintHtml();
  popup.document.open();
  popup.document.write(html);
  popup.document.close();

  popup.addEventListener(
    "load",
    () => {
      setTimeout(() => {
        popup.focus();
        popup.print();
      }, 350);
    },
    { once: true }
  );
}

function translatedPage(path, lang) {
  const content = contentByLanguage[lang];
  if (!content?.pages) {
    return null;
  }

  const normalized = normalizePath(path);
  return content.pages.find((page) => normalizePath(page.file) === normalized) || null;
}

function translationMapForPage(path, targetLang) {
  const source = translatedPage(path, defaultLanguageCode());
  const target = translatedPage(path, targetLang);
  if (!source?.chunks || !target?.chunks) {
    return null;
  }

  const size = Math.min(source.chunks.length, target.chunks.length);
  const mapping = new Map();

  for (let index = 0; index < size; index += 1) {
    const sourceText = cleanText(source.chunks[index]);
    const targetText = target.chunks[index];

    if (!sourceText || !cleanText(targetText)) {
      continue;
    }

    if (!mapping.has(sourceText)) {
      mapping.set(sourceText, targetText);
    }
  }

  return mapping;
}

function translatableElements(doc) {
  const selector = "h1,h2,h3,h4,h5,h6,p,li,td,th,span,a";
  const nodes = Array.from(doc.querySelectorAll(selector)).filter(
    (node) => cleanText(node.textContent).length > 0
  );

  // Translate only leaf text elements so container structure/classes stay intact.
  // This prevents table cells (td/th) from losing styled child paragraphs.
  return nodes.filter((node) => {
    const descendants = Array.from(node.querySelectorAll(selector));
    return !descendants.some(
      (child) => child !== node && cleanText(child.textContent).length > 0
    );
  });
}

function isLikelyTechnicalNoise(text) {
  const value = cleanText(text);
  if (!value) {
    return true;
  }

  // Asset names and random OCR tokens from export layers.
  if (/\b\S+\.(png|jpg|jpeg|svg|webp)\b/i.test(value)) {
    return true;
  }

  if (/[A-Za-z0-9_-]{24,}/.test(value)) {
    return true;
  }

  // Pure separators or single-character crumbs.
  if (/^[\W_]+$/.test(value) || value.length <= 1) {
    return true;
  }

  return false;
}

function hideMicroTextLayers(doc) {
  const selector = "h1,h2,h3,h4,h5,h6,p,li,td,th,span,a";
  const nodes = Array.from(doc.querySelectorAll(selector));

  for (const node of nodes) {
    const text = cleanText(node.textContent);
    if (!text) {
      continue;
    }

    const style = getComputedStyle(node);
    const size = parseFloat(style.fontSize) || 0;
    if (size > 2.5) {
      continue;
    }

    if (!isLikelyTechnicalNoise(text)) {
      continue;
    }

    node.style.display = "none";
    node.dataset.microTextLayer = "1";
  }
}

function hideResidualMicroTextLayers(doc) {
  const selector = "h1,h2,h3,h4,h5,h6,p,li,td,th,span,a";
  const nodes = Array.from(doc.querySelectorAll(selector));

  for (const node of nodes) {
    const text = cleanText(node.textContent);
    if (!text) {
      continue;
    }

    const style = getComputedStyle(node);
    const size = parseFloat(style.fontSize) || 0;
    if (size > 2.5) {
      continue;
    }

    node.style.display = "none";
    node.dataset.microTextLayer = "1";
  }
}

function hasFixedBox(element) {
  const style = getComputedStyle(element);
  const width = parseFloat(style.width) || 0;
  const height = parseFloat(style.height) || 0;
  return width > 0 && height > 0;
}

function promoteMicroTranslatedLayer(element, minReadableSize) {
  const style = getComputedStyle(element);
  const parentWidth = element.parentElement?.clientWidth || 0;
  const currentWidth = parseFloat(style.width) || element.clientWidth || 0;
  const left = parseFloat(style.left) || 0;

  let expandedWidth = currentWidth;
  if (parentWidth > 0) {
    expandedWidth = Math.max(currentWidth, parentWidth - left - 8);
  } else {
    expandedWidth = Math.max(currentWidth, 260);
  }

  element.style.display = "block";
  element.style.fontSize = `${minReadableSize}px`;
  element.style.lineHeight = `${Math.max(minReadableSize * 1.28, 16)}px`;
  element.style.letterSpacing = "0px";
  element.style.whiteSpace = "normal";
  element.style.wordBreak = "break-word";
  element.style.overflowWrap = "break-word";
  element.style.width = `${Math.round(expandedWidth)}px`;
  element.style.height = "auto";
  element.style.overflow = "visible";
  element.style.backgroundColor = "rgba(255,255,255,0.92)";
  element.style.padding = "0 2px";
  element.style.borderRadius = "2px";
  element.style.zIndex = "12";
  element.dataset.translationOverflow = "1";
}

function fitTranslatedText(element) {
  const computed = getComputedStyle(element);
  const originalSize = parseFloat(element.dataset.originalMaxFontSize) || parseFloat(computed.fontSize) || 16;
  const originalLineHeight = computed.lineHeight;
  const originalLetterSpacing = computed.letterSpacing;

  element.style.fontSize = `${originalSize}px`;
  element.style.lineHeight = originalLineHeight;
  element.style.letterSpacing = originalLetterSpacing;

  const fixed = hasFixedBox(element);

  if (fixed) {
    const parentWidth = element.parentElement?.clientWidth || 0;
    const currentLeft = parseFloat(computed.left) || 0;
    if (parentWidth > 0) {
      element.style.maxWidth = `${Math.max(0, parentWidth - currentLeft - 16)}px`;
    }

    // Allow text to wrap if it exceeds the page width.
    element.style.whiteSpace = "normal";
    element.style.wordBreak = "break-word";
    element.style.overflowWrap = "break-word";
  } else {
    element.style.whiteSpace = "normal";
    element.style.wordBreak = "break-word";
    element.style.overflowWrap = "anywhere";
  }

  if (!fixed) {
    return;
  }

  const minReadableSize = 12.5;

  if (fixed && originalSize <= 2.5) {
    promoteMicroTranslatedLayer(element, minReadableSize);
    return;
  }

  // We explicitly DO NOT shrink font size here anymore, 
  // because the user requested to keep font sizes consistent with the original.
  // Instead, the text will wrap to multiple lines if it exceeds maxWidth.
}
// In Apple Pages "wrap around image" layouts, images are placed as absolutely-positioned
// spans inside 1px-font-size paragraphs, visually overlapping part of a text column.
// For translated text, we must limit max-width to the column space left of such images.
//
// IMPORTANT: In two-column Apple Pages exports the images live directly under the root
// .body <div> while text lives inside child column <div>s. These are separate DOM branches,
// so we must work exclusively in BODY-coordinate space and compare all rects there,
// regardless of DOM parentage. This is the fix for white-field artifacts on pages like
// 13, 17 and 30 in the English translation.
function applyImageWidthConstraints(doc) {
  const pageHeight = Math.max(
    doc.documentElement?.clientHeight || 0,
    doc.body?.clientHeight || 0,
    768
  );

  // Compute position in body-coordinate space by summing style.left / style.top
  // of the element and every ancestor up to (but not including) <body>.
  function bodyCoord(el, axis) {
    let v = 0;
    let curr = el;
    while (curr && curr.tagName !== 'BODY' && curr.tagName !== 'HTML') {
      v += parseFloat(curr.style[axis]) || 0;
      curr = curr.parentElement;
    }
    return v;
  }

  // Collect ALL overlay images from the whole document in body coordinates.
  // Apple Pages wraps each non-inline image as:
  //   <p style="font-size:1px"><span style="display:inline-block;position:absolute;...><img ...>
  const overlayImages = [];
  for (const p of doc.querySelectorAll('p')) {
    if (parseFloat(p.style.fontSize) > 1.5) continue;
    const span = p.querySelector('span[style*="position:absolute"]');
    if (!span) continue;
    const img = span.querySelector('img');
    if (!img) continue;
    const w = parseFloat(img.style.width) || parseFloat(span.style.width) || 0;
    const h = parseFloat(img.style.height) || parseFloat(span.style.height) || 0;
    if (w < 30 || h < 30) continue; // skip tiny inline icons / bullets
    const left = bodyCoord(span, 'left');
    const top  = bodyCoord(span, 'top');

    // Bottom-zone product photos with callouts should not trigger text wrap-around,
    // because translated text then squeezes into narrow columns and collides with labels.
    if (top > pageHeight * 0.6) continue;

    overlayImages.push({ left, top, right: left + w, bottom: top + h });
  }
  if (overlayImages.length === 0) return;

  // For each visible translated paragraph compute its rect in BODY coordinates
  // and check whether any image overlaps from the right.
  const translatedPs = Array.from(doc.querySelectorAll('p[data-was-translated="1"]')).filter(p =>
    p.style.display !== 'none' && p.textContent.trim().length > 0
  );

  for (const p of translatedPs) {
    const parent = p.parentElement;
    if (!parent) continue;

    // Body-coordinate origin of the parent column div.
    const colLeft  = bodyCoord(parent, 'left');
    const colTop   = bodyCoord(parent, 'top');
    const colWidth = parent.clientWidth || parseFloat(parent.style.width) || 0;

    // Left offset of this paragraph WITHIN its column.
    const leftOff  = parseFloat(p.style.left) || 0;

    // Paragraph's left edge in body coordinates.
    const pAbsLeft = colLeft + leftOff;

    // Effective current max-width (may already have been constrained by mergeTranslatedLines).
    const curMaxW  = parseFloat(p.style.maxWidth) || (colWidth - leftOff - 8);

    // Paragraph's top / bottom in body coordinates.
    // Use originalTop so we compare against the pre-merge position.
    const elOrigTop   = parseFloat(p.dataset.originalTop) || parseFloat(p.style.top) || 0;
    const elAbsTop    = colTop + elOrigTop;
    // Use actual rendered height (after merging) rather than original single-line height.
    const elActualBot = elAbsTop + p.offsetHeight;

    let bestW = curMaxW;

    for (const img of overlayImages) {
      // --- Case 1: image is to the RIGHT of this paragraph's left edge ---
      // The image right edge must reach past the paragraph left edge, and the
      // image left edge must be further right than the paragraph left edge.
      if (img.left > pAbsLeft + 20 && img.right > pAbsLeft + 40) {
        // Vertically, the paragraph (after potential text expansion) must overlap the image.
        if (elActualBot <= img.top + 5 || elAbsTop >= img.bottom - 5) continue;

        // Available horizontal space from paragraph left edge to image left edge.
        const avail = img.left - pAbsLeft - 12;
        if (avail > 40 && avail < bestW) bestW = avail;
        continue;
      }

      // --- Case 2: image is to the LEFT of (or coincident with) this paragraph ---
      // but the paragraph starts ABOVE the image and (after text expansion) reaches
      // DOWN into the image zone.  In that case cap the paragraph height.
      if (img.right <= pAbsLeft + 20) {
        // Image is clearly to the left — no horizontal constraint needed.
        continue;
      }

      // Image horizontally overlaps paragraph (mixed / partial overlap).
      // Only apply a maxHeight guard when the paragraph starts above the image.
      if (elAbsTop < img.top - 5 && elActualBot > img.top + 5) {
        const maxH = img.top - elAbsTop - 2;
        if (maxH > 10 && !p.style.maxHeight) {
          p.style.maxHeight = maxH + 'px';
          p.style.overflow = 'hidden';
        }
      }
    }

    if (bestW < curMaxW) {
      p.style.maxWidth = Math.max(10, bestW) + 'px';
    }
  }
}

function resolveOverlaps(doc) {
  const allElements = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6')).filter(e => {
    return getComputedStyle(e).position === 'absolute' && e.textContent.trim().length > 0;
  });

  if (allElements.length === 0) return;

  // Group by parent container so two-column layouts don't interfere with each other
  const byParent = new Map();
  for (const el of allElements) {
    const parent = el.parentElement;
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(el);
  }

  for (const [, children] of byParent) {
    children.sort((a, b) => parseFloat(a.style.top) - parseFloat(b.style.top));

    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const top = parseFloat(el.style.top);
      const height = el.offsetHeight;
      if (height === 0) continue;

      const bottom = top + height + 2;

      for (let j = i + 1; j < children.length; j++) {
        const nextEl = children[j];
        if (nextEl.offsetHeight === 0) continue;

        const nextTop = parseFloat(nextEl.style.top);
        if (nextTop >= bottom) continue;

        const push = bottom - nextTop;

        // Push this element and everything below it in the same column
        for (let k = j; k < children.length; k++) {
          children[k].style.top = (parseFloat(children[k].style.top) + push) + 'px';
        }
        break; // Re-evaluate from i+1 with the new positions
      }
    }
  }
}

function captureOriginalLayout(doc) {
  const absEls = Array.from(doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6')).filter(e => {
    return getComputedStyle(e).position === 'absolute';
  });
  for (const el of absEls) {
    el.dataset.originalTop = parseFloat(el.style.top) || 0;
    el.dataset.originalHeight = el.offsetHeight || 22;
  }
}

// Merge consecutive absolutely-positioned lines that were visually continuous in the
// original (gap <= 5px between bottom of one and top of the next). Apple Pages exports
// each visual line as a separate <p>; for translated text these must flow as one block.
function mergeTranslatedLines(doc) {
  const allPs = Array.from(doc.querySelectorAll('p')).filter(p => {
    return getComputedStyle(p).position === 'absolute' &&
           p.textContent.trim().length > 0 &&
           p.style.display !== 'none' &&
           p.dataset.wasTranslated === '1';
  });

  const byParent = new Map();
  for (const p of allPs) {
    const parent = p.parentElement;
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(p);
  }

  for (const [parent, children] of byParent) {
    children.sort((a, b) =>
      (parseFloat(a.dataset.originalTop) || 0) - (parseFloat(b.dataset.originalTop) || 0)
    );

    const groups = [];
    let currentGroup = [children[0]];

    for (let i = 1; i < children.length; i++) {
      const prev = currentGroup[currentGroup.length - 1];
      const curr = children[i];
      const prevTop = parseFloat(prev.dataset.originalTop) || 0;
      const prevH = parseFloat(prev.dataset.originalHeight) || 22;
      const currTop = parseFloat(curr.dataset.originalTop) || 0;
      const gap = currTop - (prevTop + prevH);
      // Also break the group when the left offset changes significantly — this
      // happens in wrap-around layouts where some paragraphs are indented to
      // flow beside an image (e.g. style.left≈162px) while preceding ones are
      // full-width (style.left≈0). Merging them would absorb all text into the
      // first element and leave a white gap beside the image.
      const prevLeft = parseFloat(prev.style.left) || 0;
      const currLeft = parseFloat(curr.style.left) || 0;
      const leftChange = Math.abs(currLeft - prevLeft);

      if (gap <= 5 && leftChange < 20) {
        currentGroup.push(curr);
      } else {
        groups.push(currentGroup);
        currentGroup = [curr];
      }
    }
    groups.push(currentGroup);

    for (const group of groups) {
      if (group.length <= 1) continue;

      const firstEl = group[0];
      const parentWidth = parent.clientWidth;
      const leftOffset = parseFloat(firstEl.style.left) || 0;

      // Move all child nodes from subsequent elements into the first,
      // preserving the inline-span styling (bold, color, etc.)
      for (let i = 1; i < group.length; i++) {
        const el = group[i];
        firstEl.appendChild(doc.createTextNode(' '));
        while (el.firstChild) {
          firstEl.appendChild(el.firstChild);
        }
        el.style.display = 'none';
      }

      firstEl.style.whiteSpace = 'normal';
      firstEl.style.wordBreak = 'break-word';
      firstEl.style.overflowWrap = 'break-word';
      firstEl.style.height = 'auto';
      firstEl.style.maxWidth = Math.max(10, parentWidth - leftOffset - 8) + 'px';
    }
  }
}

function normalizeDeviceNamesInDocument(doc) {
  if (!doc) {
    return;
  }

  const walkerRoot = doc.body || doc.documentElement;
  const walker = doc.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT);
  const nodes = [];

  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE)$/i.test(parent.tagName)) {
      continue;
    }

    const parentStyle = getComputedStyle(parent);
    const fontSize = parseFloat(parentStyle.fontSize) || 0;
    if (fontSize <= 2.5) {
      continue;
    }

    const text = node.textContent || "";
    const normalized = text
      .replace(/\b(?:VibeYy|VibeYs|Vibey|vibeY|VIBEY|VibeY|Vibe)\b/g, "VibeY")
      .replace(/\b(?:SpreadYy|SpreadYs|Spready|spreadY|SPREADY|SpreadY|Spread)\b/g, "SpreadY")
      .replace(/\b(?:JumpYy|JumpYs|Jumpy|jumpY|JUMPY|JumpY|Jump)\b/g, "JumpY")
      .replace(/\b(?:SpaceYy|SpaceYs|Spacey|spaceY|SPACEY|SpaceY|Space)\b/g, "SpaceY");

    if (normalized !== text) {
      node.textContent = normalized;
    }
  }
}

function hideGraphicYSuffixImages(doc) {
  if (!doc) {
    return;
  }

  // Hide only tiny decorative glyph layers (the small graphic Y), nothing else.
  const images = Array.from(doc.querySelectorAll("img"));
  for (const img of images) {
    const imgStyle = getComputedStyle(img);
    const width = parseFloat(imgStyle.width) || parseFloat(img.getAttribute("width")) || img.clientWidth || 0;
    const height = parseFloat(imgStyle.height) || parseFloat(img.getAttribute("height")) || img.clientHeight || 0;

    if (width <= 16 && height <= 18) {
      img.style.display = "none";
      img.dataset.hiddenGraphicY = "1";
    }
  }
}

function removeTinyInlinePlaceholders(doc) {
  if (!doc) {
    return;
  }

  // Pages often keeps an empty inline-block spacer where the tiny Y image used to be.
  // Remove only very small empty placeholders so large layout elements remain intact.
  const spans = Array.from(doc.querySelectorAll("span[style*='display:inline-block']"));
  for (const span of spans) {
    const text = cleanText(span.textContent || "");
    if (text.length > 0 || span.querySelector("img")) {
      continue;
    }

    const style = getComputedStyle(span);
    const width = parseFloat(style.width) || 0;
    const height = parseFloat(style.height) || 0;

    if (width <= 16 && height <= 18) {
      span.remove();
    }
  }
}

function collapseExtraSpacesAfterDeviceY(doc) {
  if (!doc) {
    return;
  }

  const walkerRoot = doc.body || doc.documentElement;
  const walker = doc.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT);
  const nodes = [];

  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || /^(SCRIPT|STYLE)$/i.test(parent.tagName)) {
      continue;
    }

    const text = node.textContent || "";
    const normalized = text
      .replace(/\b(VibeY|SpreadY|JumpY|SpaceY)\s{2,}/g, "$1 ")
      .replace(/\s{2,}(?=[,.;!?])/g, " ");

    if (normalized !== text) {
      node.textContent = normalized;
    }
  }
}

function styleDeviceSuffixY(doc) {
  if (!doc) {
    return;
  }

  if (!doc.getElementById("device-y-style")) {
    const style = doc.createElement("style");
    style.id = "device-y-style";
    style.textContent = ".device-y-suffix{color:#c62828;font-weight:700;}";
    doc.head?.appendChild(style);
  }

  const selector = "h1,h2,h3,h4,h5,h6,p,li,td,th,span,a";
  const walkerRoot = doc.body || doc.documentElement;
  const walker = doc.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT);
  const nodes = [];

  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent) {
      continue;
    }

    if (!parent.closest(selector) || parent.closest(".device-y-suffix")) {
      continue;
    }

    if (/^(SCRIPT|STYLE)$/i.test(parent.tagName)) {
      continue;
    }

    const parentStyle = getComputedStyle(parent);
    const fontSize = parseFloat(parentStyle.fontSize) || 0;
    if (fontSize <= 2.5) {
      continue;
    }

    const text = node.textContent || "";
    const regex = /\b(Vibe|Spread|Jump|Space)Y\b/g;
    if (!regex.test(text)) {
      continue;
    }

    regex.lastIndex = 0;
    const fragment = doc.createDocumentFragment();
    let lastIndex = 0;
    let match = regex.exec(text);

    while (match) {
      const full = match[0];
      const base = match[1];
      const start = match.index;
      const yIndex = start + full.length - 1;

      if (start > lastIndex) {
        fragment.appendChild(doc.createTextNode(text.slice(lastIndex, start)));
      }

      fragment.appendChild(doc.createTextNode(base));
      const ySpan = doc.createElement("span");
      ySpan.className = "device-y-suffix";
      ySpan.textContent = "Y";
      fragment.appendChild(ySpan);

      lastIndex = yIndex + 1;
      match = regex.exec(text);
    }

    if (lastIndex < text.length) {
      fragment.appendChild(doc.createTextNode(text.slice(lastIndex)));
    }

    parent.replaceChild(fragment, node);
  }
}

function normalizeOversizedImages(doc) {
  if (!doc) {
    return;
  }

  const pageWidth = Math.max(
    doc.documentElement?.clientWidth || 0,
    doc.body?.clientWidth || 0,
    1024
  );
  const maxImageWidth = Math.min(560, Math.round(pageWidth * 0.58));

  for (const image of Array.from(doc.querySelectorAll("img"))) {
    const style = getComputedStyle(image);
    const width = parseFloat(style.width) || image.clientWidth || 0;
    const height = parseFloat(style.height) || image.clientHeight || 0;

    if (width > pageWidth * 0.72) {
      image.style.width = `${maxImageWidth}px`;
      image.style.maxWidth = `${maxImageWidth}px`;
      image.style.height = "auto";
      image.style.objectFit = "contain";
    }
  }
}

function normalizeDefaultLanguageFlow(doc) {
  captureOriginalLayout(doc);
  hideMicroTextLayers(doc);

  const readableParagraphs = Array.from(doc.querySelectorAll("p")).filter((element) => {
    const text = cleanText(element.textContent);
    if (!text) {
      return false;
    }

    const style = getComputedStyle(element);
    const isAbsolute = style.position === "absolute";
    const fontSize = parseFloat(style.fontSize) || 0;
    return isAbsolute && fontSize >= 11;
  });

  for (const paragraph of readableParagraphs) {
    paragraph.dataset.wasTranslated = "1";
    fitTranslatedText(paragraph);
  }

  hideResidualMicroTextLayers(doc);
  mergeTranslatedLines(doc);
  applyImageWidthConstraints(doc);
  resolveOverlaps(doc);
  normalizeOversizedImages(doc);
}

function applyPageTranslation() {
  const frameDocument = ui.viewer.contentDocument;
  if (!frameDocument) {
    return;
  }

  hideGraphicYSuffixImages(frameDocument);
  removeTinyInlinePlaceholders(frameDocument);

  if (language === defaultLanguageCode()) {
    normalizeDefaultLanguageFlow(frameDocument);
    return;
  }

  // Capture original positions BEFORE any DOM modifications
  captureOriginalLayout(frameDocument);

  hideMicroTextLayers(frameDocument);

  const mapping = translationMapForPage(currentPagePath(), language);
  const fallback = fallbackByLanguage[language] || null;
  if ((!mapping || mapping.size === 0) && !fallback) {
    normalizeOversizedImages(frameDocument);
    return;
  }

  const elements = translatableElements(frameDocument);
  for (const element of elements) {
    const sourceText = cleanText(extractNodeText(element));
    const translatedText = mapping?.get(sourceText) || fallback?.[sourceText];
    if (!translatedText) {
      continue;
    }

    let maxFontSize = 0;
    const segments = [];

    // Collect all computed styles from all original child text nodes
    function walk(node) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (!text) return;
        const computed = getComputedStyle(node.parentElement);
        const fSize = parseFloat(computed.fontSize) || 0;
        if (fSize > maxFontSize) maxFontSize = fSize;
        
        segments.push({
          text: text,
          color: computed.color,
          fontWeight: computed.fontWeight,
          fontStyle: computed.fontStyle,
          textDecoration: computed.textDecoration
        });
      } else if (node.nodeType === 1) {
        if (/^(SCRIPT|STYLE)$/i.test(node.tagName)) return;
        Array.from(node.childNodes).forEach(walk);
      }
    }
    walk(element);

    if (maxFontSize > 0) {
      element.dataset.originalMaxFontSize = maxFontSize;
    }

    const rawSourceText = segments.map(s => s.text).join('');
    
    // If we have text segments, project the styles over the translated string
    if (rawSourceText.length > 0 && segments.length > 0) {
      element.innerHTML = '';
      const tokens = translatedText.match(/(\s+|\S+)/g) || [translatedText];
      let currentTargetIndex = 0;
      let currentSpan = null;
      let currentStyleKey = null;

      for (const token of tokens) {
        const tokenCenter = currentTargetIndex + token.length / 2;
        const ratio = rawSourceText.length / Math.max(1, translatedText.length);
        const mappedSourceCenter = tokenCenter * ratio;
        
        let segmentScore = 0;
        let foundSegment = segments[0];
        for (const seg of segments) {
          if (mappedSourceCenter >= segmentScore && mappedSourceCenter < segmentScore + seg.text.length) {
            foundSegment = seg;
            break;
          }
          segmentScore += seg.text.length;
        }
        
        const styleKey = `${foundSegment.color}|${foundSegment.fontWeight}|${foundSegment.fontStyle}|${foundSegment.textDecoration}`;
        
        if (styleKey !== currentStyleKey) {
          currentSpan = document.createElement('span');
          currentSpan.style.color = foundSegment.color;
          currentSpan.style.fontWeight = foundSegment.fontWeight;
          currentSpan.style.fontStyle = foundSegment.fontStyle;
          currentSpan.style.textDecoration = foundSegment.textDecoration;
          element.appendChild(currentSpan);
          currentStyleKey = styleKey;
        }
        currentSpan.textContent += token;
        currentTargetIndex += token.length;
      }
    } else {
      element.textContent = translatedText;
    }

    element.dataset.wasTranslated = '1';
    fitTranslatedText(element);
  }

  // Any tiny text left after translation is typically an EPUB export helper layer.
  hideResidualMicroTextLayers(frameDocument);

  // Merge consecutive visual lines (gap <= 5px in original) into one flowing paragraph.
  // This reverses Apple Pages' fixed-layout line fragmentation for the translated text.
  mergeTranslatedLines(frameDocument);

  // Constrain max-width of translated paragraphs that sit beside overlay images
  // (Apple Pages "wrap around image" layout: image takes up part of the column width).
  applyImageWidthConstraints(frameDocument);

  // Push down any remaining absolutely positioned elements that still overlap.
  resolveOverlaps(frameDocument);
  normalizeOversizedImages(frameDocument);

}

function setViewerSource(path) {
  setCurrentPageIndexByPath(path);
  const pageUrl = withRevision(path);
  if (ui.viewer) {
    ui.viewer.src = pageUrl;
  }

  updatePagerUi();
}

function applyUiText() {
  document.body.classList.toggle("lang-en", language === "en");
  document.documentElement.lang = language;

  setText(ui.appTitle, "uputstvo za upotrebu");
  setText(ui.langLabel, dictionary.app.langLabel);
  setText(ui.langToggle, `${languageFlag(language)} ${getLanguageConfig(language)?.label || dictionary.app.langButton || language.toUpperCase()}`);
  setText(ui.languageDialogTitle, dictionary.app.languageDialogTitle || dictionary.app.langLabel || "Izbor jezika");
  setText(ui.languageDialogHint, dictionary.app.languageDialogHint || "Izaberi jezik za prikaz interfejsa i sadržaja.");
  setText(ui.languageDialogClose, dictionary.app.languageDialogClose || "Zatvori");
  setText(ui.tocTitle, dictionary.app.tocTitle);
  setText(ui.tocHint, dictionary.app.tocHint);

  if (ui.homePage) {
    ui.homePage.setAttribute("aria-label", dictionary.app.homeButton);
    ui.homePage.setAttribute("title", dictionary.app.homeButton);
  }

  if (ui.prevPage) {
    ui.prevPage.setAttribute("aria-label", dictionary.app.prevButton);
    ui.prevPage.setAttribute("title", dictionary.app.prevButton);
  }

  if (ui.nextPage) {
    ui.nextPage.setAttribute("aria-label", dictionary.app.nextButton);
    ui.nextPage.setAttribute("title", dictionary.app.nextButton);
  }

  if (ui.exportPdf) {
    const pdfLabel = dictionary.app.pdfExportButton || "PDF Export / Print";
    ui.exportPdf.textContent = pdfLabel;
    ui.exportPdf.setAttribute("aria-label", pdfLabel);
    ui.exportPdf.setAttribute("title", pdfLabel);
  }

  if (ui.langToggle) {
    const label = getLanguageConfig(language)?.label || dictionary.app.langButton || language.toUpperCase();
    ui.langToggle.innerHTML = flaggedLabel(language, label);
  }
  
  renderToc();
  renderLanguageOptions();
  updatePagerUi();
}

function renderLanguageOptions() {
  if (!ui.languageOptions) {
    return;
  }

  ui.languageOptions.innerHTML = "";

  availableLanguages().forEach((item) => {
    const code = normalizeLanguageCode(item.code);
    const flag = languageFlag(code);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `language-option${code === language ? " current" : ""}`;
    button.dataset.lang = code;

    const codeNode = document.createElement("span");
    codeNode.className = "language-option-code";
    codeNode.innerHTML = flaggedLabel(code, (item.label || code.toUpperCase()).toUpperCase());

    const nameNode = document.createElement("span");
    nameNode.className = "language-option-name";
    nameNode.textContent = item.name || item.label || code.toUpperCase();

    button.appendChild(codeNode);
    button.appendChild(nameNode);
    ui.languageOptions.appendChild(button);
  });
}

function renderToc() {
  if (!ui.tocList) {
    return;
  }

  ui.tocList.innerHTML = "";

  tocEntries.forEach((entry, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    const translated =
      dictionary.toc?.[entry.id] ||
      dictionary.toc?.[`index-${index + 1}`] ||
      entry.label;

    a.href = "#";
    a.textContent = translated;
    a.addEventListener("click", (event) => {
      event.preventDefault();
      setViewerSource(`OPS/${entry.href}`);
    });

    li.appendChild(a);
    ui.tocList.appendChild(li);
  });
}

async function parseToc() {
  const tocSource = await fetch(TOC_PAGE).then((response) => response.text());
  const xml = new DOMParser().parseFromString(tocSource, "application/xhtml+xml");

  const tocNav = Array.from(xml.querySelectorAll("nav")).find(
    (node) => (node.getAttribute("epub:type") || "").toLowerCase() === "toc"
  );

  const links = tocNav ? Array.from(tocNav.querySelectorAll("a")) : [];

  tocEntries = links.map((link, index) => {
    const href = (link.getAttribute("href") || "").replace(/^\.\//, "");
    const label = link.textContent.trim();
    return {
      id: `index-${index + 1}`,
      href,
      label
    };
  });
}

function getAttribute(source, name) {
  const match = source.match(new RegExp(`${name}="([^"]+)"`, "i"));
  return match ? match[1] : "";
}

function sortedUniquePages(pages) {
  const unique = Array.from(new Set(pages.filter((item) => /^OPS\/page-\d+\.xhtml$/.test(item))));
  return unique.sort((a, b) => {
    const left = Number((a.match(/page-(\d+)\.xhtml/) || ["", "0"])[1]);
    const right = Number((b.match(/page-(\d+)\.xhtml/) || ["", "0"])[1]);
    return left - right;
  });
}

async function parsePageSequence() {
  const opfSource = await fetch(OPF_PAGE_ORDER).then((response) => response.text());

  const manifest = new Map();
  for (const itemMatch of opfSource.matchAll(/<item\b[^>]*>/gi)) {
    const tag = itemMatch[0];
    const id = getAttribute(tag, "id");
    const href = getAttribute(tag, "href");
    if (id && href) {
      manifest.set(id, href.replace(/^\.\//, ""));
    }
  }

  const orderedPages = [];
  for (const itemRefMatch of opfSource.matchAll(/<itemref\b[^>]*>/gi)) {
    const tag = itemRefMatch[0];
    const idref = getAttribute(tag, "idref");
    const href = manifest.get(idref);

    if (href && /^page-\d+\.xhtml$/.test(href)) {
      orderedPages.push(`OPS/${href}`);
    }
  }

  pageSequence = orderedPages.length > 0
    ? orderedPages
    : sortedUniquePages(tocEntries.map((entry) => `OPS/${entry.href}`));

  if (pageSequence.length === 0 || normalizePath(pageSequence[0]) !== normalizePath(HOME_PAGE)) {
    pageSequence.unshift(HOME_PAGE);
  }
}

function goToRelativePage(step) {
  if (pageSequence.length === 0) {
    return;
  }

  const targetIndex = Math.max(0, Math.min(pageSequence.length - 1, currentPageIndex + step));
  if (targetIndex === currentPageIndex) {
    return;
  }

  setViewerSource(pageSequence[targetIndex]);
}

async function selectLanguage(nextLanguage) {
  const target = normalizeLanguageCode(nextLanguage);
  if (!target || target === language || !getLanguageConfig(target)) {
    return;
  }

  language = target;
  localStorage.setItem(LANGUAGE_KEY, language);

  await Promise.all([
    loadLanguage(language),
    loadContentForLanguage(language),
    loadFallbackForLanguage(language)
  ]);
  applyUiText();
  setViewerSource((ui.viewer && currentPagePath()) || HOME_PAGE);
}

function openLanguageDialog() {
  renderLanguageOptions();
  if (ui.languageDialog?.showModal) {
    ui.languageDialog.showModal();
  }
}

async function bootstrap() {
  await Promise.all([parseToc(), loadLanguagesManifest(), parsePageSequence()]);
  await Promise.all([
    loadLanguage(language),
    loadContentForLanguage(defaultLanguageCode()),
    loadContentForLanguage(language),
    loadFallbackForLanguage(language)
  ]);

  if (ui.langToggle) {
    ui.langToggle.addEventListener("click", () => {
      openLanguageDialog();
    });
  }

  if (ui.languageDialogClose) {
    ui.languageDialogClose.addEventListener("click", () => {
      ui.languageDialog?.close?.();
    });
  }

  if (ui.languageOptions) {
    ui.languageOptions.addEventListener("click", async (event) => {
      const target = event.target.closest("button.language-option");
      if (!target) {
        return;
      }

      try {
        await selectLanguage(target.dataset.lang || "");
        ui.languageDialog?.close?.();
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  }

  ui.homePage?.addEventListener("click", () => setViewerSource(HOME_PAGE));
  ui.prevPage?.addEventListener("click", () => goToRelativePage(-1));
  ui.nextPage?.addEventListener("click", () => goToRelativePage(1));
  ui.exportPdf?.addEventListener("click", exportCurrentPagePdf);
  ui.viewer?.addEventListener("load", applyPageTranslation);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      goToRelativePage(-1);
    }

    if (event.key === "ArrowRight") {
      goToRelativePage(1);
    }
  });

  setViewerSource(HOME_PAGE);
  applyUiText();
}

bootstrap().catch((error) => {
  console.error(error);
  alert(error.message);
});
