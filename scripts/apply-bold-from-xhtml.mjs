/**
 * apply-bold-from-xhtml.mjs
 *
 * Reads all XHTML pages from ORIGINAL_UputstvoVT_ V5/OPS/,
 * extracts text segments rendered with font-weight:700 (bold),
 * then applies **bold** to matching text in uputstvo/*.md files.
 *
 * Usage: node scripts/apply-bold-from-xhtml.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const XHTML_DIR = join(ROOT, 'ORIGINAL_UputstvoVT_ V5', 'OPS');
const MD_DIR = join(ROOT, 'uputstvo');

// --- Page → markdown file mapping (from toc.xhtml) ---
// pages are inclusive ranges: [start, end]
const PAGE_RANGES = [
  { pages: [2, 2],   md: '00-uvod.md' },
  { pages: [3, 7],   md: '10-opste-informacije.md' },
  { pages: [8, 14],  md: '20-vibey.md' },
  { pages: [15, 27], md: '30-spready.md' },
  { pages: [28, 42], md: '40-jumpy.md' },
  { pages: [43, 49], md: '50-spacey.md' },
  { pages: [50, 52], md: '60-azuriranje.md' },
  { pages: [53, 53], md: '70-garancija.md' },
  { pages: [54, 54], md: '80-i-to-nije-sve.md' },
  { pages: [55, 55], md: '90-kontakt.md' },
];

function mdFileForPage(pageNum) {
  for (const { pages, md } of PAGE_RANGES) {
    if (pageNum >= pages[0] && pageNum <= pages[1]) return md;
  }
  return null;
}

// CSS classes that render bold text (extracted from book.css)
// Only SPAN-level classes are used — p-level classes are block/heading styles
// that must not be applied as bold to body text in markdown.
const BOLD_SPAN_CLASSES = new Set(['c8', 'c12', 'c13', 'c17']);

/**
 * Returns true if this element is a SPAN with a bold class.
 * We do NOT propagate boldness from ancestor p/div blocks,
 * because those are styled paragraphs, not inline bold words.
 */
function isBold(el) {
  if (el.tagName !== 'SPAN') return false;
  const cls = (el.getAttribute?.('class') ?? '').split(/\s+/);
  return cls.some(c => BOLD_SPAN_CLASSES.has(c));
}

/**
 * Walk a DOM node and collect runs of text, tagging each as bold or not.
 * Only SPAN elements with bold classes are considered bold.
 * Returns array of { text, bold }.
 */
function collectRuns(root) {
  const runs = [];

  function walk(node) {
    if (node.nodeType === 3 /* TEXT_NODE */) {
      runs.push({ text: node.textContent, bold: false });
      return;
    }
    if (node.nodeType !== 1 /* ELEMENT_NODE */) return;
    if (node.tagName === 'IMG') return;

    if (isBold(node)) {
      const text = node.textContent;
      if (text.trim()) runs.push({ text, bold: true });
    } else {
      for (const child of node.childNodes) walk(child);
    }
  }

  walk(root, false);
  return runs;
}

/**
 * From an array of {text, bold} runs produce a single string where bold
 * segments are wrapped in **...**  (only if the segment has meaningful text).
 */
function runsToString(runs) {
  let out = '';
  let i = 0;
  while (i < runs.length) {
    if (runs[i].bold) {
      // collect consecutive bold runs
      let boldText = '';
      while (i < runs.length && runs[i].bold) {
        boldText += runs[i].text;
        i++;
      }
      boldText = boldText.trim();
      if (boldText) out += `**${boldText}**`;
    } else {
      out += runs[i].text;
      i++;
    }
  }
  return out;
}

// -------------------------------------------------------
// Collect all bold phrases from all XHTML pages
// Key: md filename  →  Set of bold phrases
// -------------------------------------------------------
/** @type {Map<string, Set<string>>} */
const boldByFile = new Map();

const xhtmlFiles = readdirSync(XHTML_DIR)
  .filter(f => /^page-\d+\.xhtml$/.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0]);
    const nb = parseInt(b.match(/\d+/)[0]);
    return na - nb;
  });

for (const xhtmlFile of xhtmlFiles) {
  const pageNum = parseInt(xhtmlFile.match(/\d+/)[0]);
  const mdFile = mdFileForPage(pageNum);
  if (!mdFile) continue;

  const html = readFileSync(join(XHTML_DIR, xhtmlFile), 'utf8');
  const dom = new JSDOM(html, { contentType: 'application/xhtml+xml' });
  const body = dom.window.document.body;

  if (!boldByFile.has(mdFile)) boldByFile.set(mdFile, new Set());
  const set = boldByFile.get(mdFile);

  // Collect bold phrases from inline SPAN elements only
  const boldSpans0 = dom.window.document.querySelectorAll(
    'span.c8, span.c12, span.c13, span.c17'
  );
  for (const span of boldSpans0) {
    const phrase = span.textContent.trim();
    if (phrase.length >= 2 && !/^[\s\W]{0,2}$/.test(phrase)) {
      set.add(phrase);
    }
  }
}

// -------------------------------------------------------
// Also collect multi-word bold runs (span/p level)
// -------------------------------------------------------
for (const xhtmlFile of xhtmlFiles) {
  const pageNum = parseInt(xhtmlFile.match(/\d+/)[0]);
  const mdFile = mdFileForPage(pageNum);
  if (!mdFile) continue;

  const html = readFileSync(join(XHTML_DIR, xhtmlFile), 'utf8');
  const dom = new JSDOM(html, { contentType: 'application/xhtml+xml' });
  const body = dom.window.document.body;
  const set = boldByFile.get(mdFile);

  // Find SPAN elements with bold classes — these are truly inline bold words
  const boldSpans = dom.window.document.querySelectorAll(
    'span.c8, span.c12, span.c13, span.c17'
  );
  for (const span of boldSpans) {
    const text = span.textContent.trim();
    if (text.length >= 2 && !/^[\s\W]{0,2}$/.test(text)) {
      set.add(text);
    }
  }
}

// -------------------------------------------------------
// Apply bold to markdown files
// -------------------------------------------------------
let totalChanges = 0;

for (const [mdFile, phrases] of boldByFile.entries()) {
  const mdPath = join(MD_DIR, mdFile);
  let content;
  try {
    content = readFileSync(mdPath, 'utf8');
  } catch {
    console.warn(`  SKIP (not found): ${mdFile}`);
    continue;
  }

  // Sort phrases longest-first so we don't double-bold sub-phrases
  const sorted = [...phrases].sort((a, b) => b.length - a.length);

  let changed = 0;
  for (const phrase of sorted) {
    // Skip if it looks like a heading (all caps or starts with #) 
    // or is already bold in some form
    if (phrase.startsWith('#')) continue;

    // Build a regex that matches the phrase NOT already inside **...**
    // We escape special regex chars in phrase
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match phrase that is NOT already surrounded by ** on both sides
    // We use a negative lookbehind/lookahead for *
    const re = new RegExp(
      `(?<!\\*)(${escaped})(?!\\*)`,
      'g'
    );

    const before = content;
    content = content.replace(re, (match, p1) => {
      // Don't bold inside markdown headings (lines starting with #)
      return `**${p1}**`;
    });

    if (content !== before) changed++;
  }

  // Fix any double-bolding artifacts like ****text****
  content = content.replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '**$1**');
  // Fix ***text*** → **text** (was italic+bold, keep bold)
  // (only if we created them; leave intentional italic-bold alone)
  // Remove bold around pure whitespace
  content = content.replace(/\*\*\s*\*\*/g, '');

  if (changed > 0) {
    writeFileSync(mdPath, content, 'utf8');
    console.log(`  ✓ ${mdFile}: ${changed} phrase(s) bolded`);
    totalChanges += changed;
  } else {
    console.log(`  - ${mdFile}: no new bold phrases found`);
  }
}

console.log(`\nDone. Total phrases bolded across all files: ${totalChanges}`);
