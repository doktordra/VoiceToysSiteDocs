#!/usr/bin/env node
/**
 * Pametan sistem prevođenja Markdown/MDX dokumentacije (sr -> en/de).
 *
 * Šta radi:
 *  - Čita srpske izvorne fajlove (uputstvo/, docs/, bezbednost/) i upisuje
 *    prevode u odgovarajući i18n/<locale>/<plugin>/current/ folder, čuvajući
 *    identičnu relativnu putanju, frontmatter (osim title/label/description),
 *    MDX komponente, tabele, slike, linkove i markdown strukturu.
 *  - Prevodi SAMO tekstualne segmente (proza, ćelije tabele, naslovi) preko
 *    LLM-a (Gemini ili Claude), uz keš i zaštićene brend termine. Struktura
 *    (markdown/MDX/tabele/slike) je očuvana kodom — model dobija samo čist tekst.
 *  - Keš (scripts/.translate-cache/sr-<locale>.json) čini ponovna pokretanja
 *    brzim i jeftinim — prevodi se samo ono što ranije nije prevedeno.
 *
 * Provajder i ključevi (postaviti u okruženje ili u .env u korenu repoa):
 *   TRANSLATE_PROVIDER=gemini|claude   (podrazumevano: gemini)
 *   GEMINI_API_KEY=...                 (ili GOOGLE_API_KEY)   GEMINI_MODEL opciono
 *   ANTHROPIC_API_KEY=...              (za --provider claude)  CLAUDE_MODEL opciono
 *
 * Upotreba:
 *   node scripts/translate-docs.mjs                      # uputstvo -> en + de
 *   node scripts/translate-docs.mjs --plugin uputstvo --locale de
 *   node scripts/translate-docs.mjs --plugin docs --locale en,de
 *   node scripts/translate-docs.mjs --plugin bezbednost --locale de --force
 *   TRANSLATE_PROVIDER=claude node scripts/translate-docs.mjs --locale de
 *
 * Opcije:
 *   --plugin   uputstvo | docs | bezbednost            (podrazumevano: uputstvo)
 *   --locale   en | de | "en,de"                       (podrazumevano: en,de)
 *   --force    ignoriši keš i prevedi sve iznova
 */

import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(root, "scripts", ".translate-cache");

// plugin -> { src: izvorni folder, dir: i18n plugin folder }
const PLUGINS = {
  uputstvo: { src: "uputstvo", dir: "docusaurus-plugin-content-docs-uputstvo" },
  docs: { src: "docs", dir: "docusaurus-plugin-content-docs" },
  bezbednost: { src: "bezbednost", dir: "docusaurus-plugin-content-docs-bezbednost" },
};

// Frontmatter ključevi čije vrednosti prevodimo (ostatak ostaje netaknut).
const TRANSLATABLE_FM_KEYS = new Set(["title", "label", "description", "sidebar_label"]);

// Brend termini koji nikada ne smeju da se prevedu/izmene.
const PROTECTED_TERMS = ["VibeY", "SpreadY", "JumpY", "SpaceY", "VoiceToys", "Voice Toys"];

function normalizeDeviceNames(text) {
  return String(text || "")
    .replace(/\b(?:VibeYy|VibeYs|Vibey|vibeY|VibeY)\b/g, "VibeY")
    .replace(/\b(?:SpreadYy|SpreadYs|Spready|spreadY|SpreadY)\b/g, "SpreadY")
    .replace(/\b(?:JumpYy|JumpYs|Jumpy|jumpY|JumpY)\b/g, "JumpY")
    .replace(/\b(?:SpaceYy|SpaceYs|Spacey|spaceY|SPACEY|SpaceY)\b/g, "SpaceY");
}

// ---- LLM provajder (Gemini ili Claude) -------------------------------------

// Učitaj .env (jednostavan parser) tako da ključevi mogu stajati van okruženja.
function loadDotEnv() {
  try {
    const txt = readFileSync(path.join(root, ".env"), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* .env je opcioni */
  }
}
loadDotEnv();

const PROVIDER = (process.env.TRANSLATE_PROVIDER || "gemini").toLowerCase();
const LANG_NAME = { en: "English", de: "German (Deutsch)" };

function systemPrompt(tl) {
  const lang = LANG_NAME[tl] || tl;
  return [
    "You are a professional translator for technical product documentation",
    `(assistive speech-therapy devices). Translate the given text from Serbian to ${lang}.`,
    "Return ONLY the translation, with no quotes, no notes and no extra text.",
    "Keep any placeholder tokens of the form \uE000<number>\uE001 EXACTLY as-is, unchanged and in place.",
    `Never translate or alter these brand names: ${PROTECTED_TERMS.join(", ")}.`,
    "Preserve markdown emphasis markers (**, *) and surrounding punctuation.",
  ].join(" ");
}

async function callGemini(text, tl) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!key) throw new Error("Nedostaje GEMINI_API_KEY (ili GOOGLE_API_KEY). Postavi ga u okruženje ili .env.");
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(tl) }] },
      contents: [{ role: "user", parts: [{ text }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data?.candidates?.[0]?.content?.parts || []).map((p) => p?.text || "").join("").trim();
}

async function callClaude(text, tl) {
  const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!key) throw new Error("Nedostaje ANTHROPIC_API_KEY. Postavi ga u okruženje ili .env.");
  const model = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature: 0.2,
      system: systemPrompt(tl),
      messages: [{ role: "user", content: text }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return (data?.content || []).map((p) => p?.text || "").join("").trim();
}

async function callLLM(text, tl) {
  if (PROVIDER === "claude" || PROVIDER === "anthropic") return callClaude(text, tl);
  return callGemini(text, tl);
}

async function translateWithRetry(text, tl, retries = 4) {
  let lastError = null;
  for (let i = 0; i < retries; i += 1) {
    try {
      const out = await callLLM(text, tl);
      if (out && out.trim()) return out;
      throw new Error("Prazan odgovor modela");
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 600 * (i + 1)));
    }
  }
  throw lastError;
}

// ---- Zaštita inline tokena (slike, linkovi, inline code, HTML/JSX tagovi) ---

const TOKEN_OPEN = "\uE000";
const TOKEN_CLOSE = "\uE001";
const INLINE_PATTERNS = [
  /!\[[^\]]*\]\([^)]*\)/g, // slike
  /\[[^\]]*\]\([^)]*\)/g, // linkovi
  /`[^`]*`/g, // inline code
  /<[^>]+>/g, // HTML/JSX inline tagovi (npr. <br />)
];

function protectInline(text) {
  const tokens = [];
  let value = text;
  for (const pattern of INLINE_PATTERNS) {
    value = value.replace(pattern, (match) => {
      const idx = tokens.push(match) - 1;
      return `${TOKEN_OPEN}${idx}${TOKEN_CLOSE}`;
    });
  }
  return { value, tokens };
}

function restoreInline(text, tokens) {
  return text.replace(
    new RegExp(`${TOKEN_OPEN}\\s*(\\d+)\\s*${TOKEN_CLOSE}`, "g"),
    (_, idx) => tokens[Number(idx)] ?? ""
  );
}

function hasLetters(text) {
  return /[A-Za-zČĆŽŠĐčćžšđ]/.test(text);
}

// ---- Prevod jednog tekstualnog segmenta (uz keš) ---------------------------

async function translateSegment(text, tl, cache, force) {
  if (!hasLetters(text)) return text;
  if (!force && Object.prototype.hasOwnProperty.call(cache, text)) return cache[text];

  const { value, tokens } = protectInline(text);
  let translated = value;
  if (hasLetters(value)) {
    const raw = await translateWithRetry(value, tl);
    translated = raw && raw.trim() ? raw : value;
  }
  let restored = restoreInline(translated, tokens);

  // Sigurnosna provera: ako su zaštićeni tokeni izgubljeni, zadrži original
  // (bolje neprevedena rečenica nego pokvaren markdown).
  const leftover = (restored.match(new RegExp(TOKEN_OPEN, "g")) || []).length;
  if (leftover > 0) restored = text;

  restored = normalizeDeviceNames(restored.replace(/\s+$/g, ""));
  cache[text] = restored;
  return restored;
}

// ---- Klasifikacija linija --------------------------------------------------

const isBlank = (l) => l.trim() === "";
const isHr = (l) => /^\s*([-*_])\s*(\1\s*){2,}$/.test(l);
const isFence = (l) => /^\s*(```|~~~)/.test(l);
const isImageOnly = (l) => /^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(l);
const isComment = (l) => /^\s*(import |export |:::|<!--|\{\/\*)/.test(l.trim());
const isTableSep = (l) => /^\s*\|?[\s:|-]+\|?\s*$/.test(l) && l.includes("-");
const isStandaloneTag = (l) => /^\s*<\/?[A-Za-z][^>]*>?\s*$/.test(l) || /^\s*\/?>\s*$/.test(l);

// ---- Frontmatter -----------------------------------------------------------

async function translateFrontmatter(lines, tl, cache, force) {
  const out = [];
  for (const line of lines) {
    const m = line.match(/^(\s*[\w.-]+:\s*)(.*)$/);
    if (!m) {
      out.push(line);
      continue;
    }
    const key = m[1].trim().replace(/:$/, "");
    let val = m[2];
    if (TRANSLATABLE_FM_KEYS.has(key) && val.trim()) {
      const quote = val.match(/^(['"]).*\1$/) ? val[0] : "";
      const bare = quote ? val.slice(1, -1) : val;
      const translated = await translateSegment(bare, tl, cache, force);
      val = quote ? `${quote}${translated}${quote}` : translated;
    }
    out.push(`${m[1]}${val}`);
  }
  return out;
}

// ---- Telo dokumenta --------------------------------------------------------

async function translateBody(lines, tl, cache, force) {
  const out = [];
  let inFence = false;
  let inJsxAttr = false;

  for (const line of lines) {
    if (isFence(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }

    // Višelinijski JSX otvarajući tag (npr. <FigureBlock\n src=...\n>)
    if (inJsxAttr) {
      out.push(line);
      if (line.includes(">")) inJsxAttr = false;
      continue;
    }
    if (/^\s*<[A-Za-z]/.test(line) && !line.includes(">")) {
      out.push(line);
      inJsxAttr = true;
      continue;
    }

    if (isBlank(line) || isHr(line) || isImageOnly(line) || isComment(line) ||
        isTableSep(line) || isStandaloneTag(line)) {
      out.push(line);
      continue;
    }

    // Red tabele: prevedi svaku ćeliju zasebno.
    if (line.includes("|") && line.trim().startsWith("|")) {
      const parts = line.split("|");
      const translatedParts = [];
      for (const part of parts) {
        if (part.trim() === "") {
          translatedParts.push(part);
        } else {
          const lead = part.match(/^\s*/)[0];
          const trail = part.match(/\s*$/)[0];
          translatedParts.push(lead + (await translateSegment(part.trim(), tl, cache, force)) + trail);
        }
      }
      out.push(translatedParts.join("|"));
      continue;
    }

    // Naslov.
    let m = line.match(/^(\s*#{1,6}\s+)(.*)$/);
    if (m) {
      out.push(m[1] + (await translateSegment(m[2], tl, cache, force)));
      continue;
    }
    // Stavka liste.
    m = line.match(/^(\s*(?:[-*+]|\d+[.)])\s+)(.*)$/);
    if (m) {
      out.push(m[1] + (await translateSegment(m[2], tl, cache, force)));
      continue;
    }
    // Citat.
    m = line.match(/^(\s*>+\s*)(.*)$/);
    if (m) {
      out.push(m[1] + (await translateSegment(m[2], tl, cache, force)));
      continue;
    }

    // Običan paragraf.
    out.push(await translateSegment(line, tl, cache, force));
  }

  return out;
}

// ---- Obrada jednog fajla ---------------------------------------------------

async function processFile(srcPath, destPath, tl, cache, force) {
  const raw = await readFile(srcPath, "utf8");
  const lines = raw.split("\n");

  let body = lines;
  let fmOut = [];
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    if (end > 0) {
      fmOut = ["---", ...(await translateFrontmatter(lines.slice(1, end), tl, cache, force)), "---"];
      body = lines.slice(end + 1);
    }
  }

  const bodyOut = await translateBody(body, tl, cache, force);
  const result = [...fmOut, ...bodyOut].join("\n");

  await mkdir(path.dirname(destPath), { recursive: true });
  await writeFile(destPath, result, "utf8");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

// ---- CLI -------------------------------------------------------------------

function parseArgs(argv) {
  const args = { plugin: "uputstvo", locale: "en,de", force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--force") args.force = true;
    else if (a === "--plugin") args.plugin = argv[++i];
    else if (a === "--locale") args.locale = argv[++i];
  }
  return args;
}

async function loadCache(locale) {
  try {
    return JSON.parse(await readFile(path.join(cacheDir, `sr-${locale}.json`), "utf8"));
  } catch {
    return {};
  }
}

async function saveCache(locale, cache) {
  await mkdir(cacheDir, { recursive: true });
  await writeFile(path.join(cacheDir, `sr-${locale}.json`), `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function run() {
  const { plugin, locale, force } = parseArgs(process.argv.slice(2));
  const cfg = PLUGINS[plugin];
  if (!cfg) {
    console.error(`Nepoznat --plugin "${plugin}". Dostupno: ${Object.keys(PLUGINS).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const locales = locale.split(",").map((l) => l.trim()).filter(Boolean);
  const srcRoot = path.join(root, cfg.src);
  try {
    await stat(srcRoot);
  } catch {
    console.error(`Izvorni folder ne postoji: ${path.relative(root, srcRoot)}`);
    process.exitCode = 1;
    return;
  }

  const files = await walk(srcRoot);

  for (const tl of locales) {
    const cache = await loadCache(tl);
    const destRoot = path.join(root, "i18n", tl, cfg.dir, "current");
    console.log(`\n[${plugin} -> ${tl}] ${files.length} fajlova`);

    let n = 0;
    for (const srcPath of files) {
      const rel = path.relative(srcRoot, srcPath);
      const destPath = path.join(destRoot, rel);
      await processFile(srcPath, destPath, tl, cache, force);
      await saveCache(tl, cache);
      n += 1;
      console.log(`  ✓ ${rel}  (${n}/${files.length})`);
    }
    await saveCache(tl, cache);
  }

  console.log("\nGotovo.");
}

run().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
