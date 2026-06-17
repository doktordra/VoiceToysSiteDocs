import fs from 'node:fs/promises';
import path from 'node:path';
import {JSDOM} from 'jsdom';
import TurndownService from 'turndown';
import he from 'he';

const projectRoot = process.cwd();
const sourceHtmlPath = '/Users/dragoljubmarkovic/Downloads/Priručnik-revizija/Priručnik_VoiceToys.html';
const sourceImagesDir = '/Users/dragoljubmarkovic/Downloads/Priručnik-revizija/images';

const outputDocsDir = path.join(projectRoot, 'docs', 'manual');
const outputImageDir = path.join(projectRoot, 'static', 'img', 'manual');

const sectionOrder = [
  {key: 'intro', title: 'Uvod', marker: null, fileName: '00-uvod.md'},
  {key: 'jumpy', title: 'JumpY', marker: 'JUMPY', fileName: '10-jumpy.md'},
  {key: 'spready', title: 'SpreadY', marker: 'SpreadY', fileName: '20-spready.md'},
  {key: 'vibey', title: 'VibeY', marker: 'VIBEY', fileName: '30-vibey.md'},
  {key: 'spacey', title: 'SpaceY', marker: 'SpaceY', fileName: '40-spacey.md'},
];

function normalizeMarker(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function cleanText(text) {
  return he.decode(text || '').replace(/\u00a0/g, ' ').trim();
}

function toMarkdown(htmlChunk) {
  const turndown = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '_',
  });

  turndown.addRule('forceLineBreak', {
    filter: 'br',
    replacement: () => '  \n',
  });

  turndown.addRule('imagePath', {
    filter: 'img',
    replacement: (content, node) => {
      const src = node.getAttribute('src') || '';
      const fileName = path.basename(src);
      return fileName ? `![${fileName}](/img/manual/${fileName})` : '';
    },
  });

  return turndown
    .turndown(htmlChunk)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function ensureDirs() {
  await fs.mkdir(outputDocsDir, {recursive: true});
  await fs.mkdir(outputImageDir, {recursive: true});
}

async function copyImagesFromSource() {
  try {
    const files = await fs.readdir(sourceImagesDir);
    await Promise.all(
      files
        .filter((name) => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name))
        .map(async (name) => {
          const srcPath = path.join(sourceImagesDir, name);
          const dstPath = path.join(outputImageDir, name);
          await fs.copyFile(srcPath, dstPath);
        })
    );
  } catch {
    // No images folder found; skip silently.
  }
}

function detectSection(text) {
  const normalized = normalizeMarker(text);
  if (normalized === 'jumpy') return 'jumpy';
  if (normalized === 'spready') return 'spready';
  if (normalized === 'vibey') return 'vibey';
  if (normalized === 'spacey') return 'spacey';
  return null;
}

async function main() {
  await ensureDirs();

  const rawHtml = await fs.readFile(sourceHtmlPath, 'utf8');
  const dom = new JSDOM(rawHtml);
  const {document} = dom.window;
  const body = document.querySelector('body');

  if (!body) {
    throw new Error('Body element not found in source HTML.');
  }

  const chunks = {
    intro: [],
    jumpy: [],
    spready: [],
    vibey: [],
    spacey: [],
  };

  let current = 'intro';
  for (const node of Array.from(body.children)) {
    const text = cleanText(node.textContent);
    const matched = detectSection(text);

    if (matched) {
      current = matched;
      continue;
    }

    const html = (node.outerHTML || '').trim();
    if (!html) continue;
    chunks[current].push(html);
  }

  for (const section of sectionOrder) {
    const key = section.key;
    const bodyHtml = (chunks[key] || []).join('\n');
    const markdownBody = toMarkdown(bodyHtml);

    const title = section.title;
    const frontMatter = [
      '---',
      `title: ${title}`,
      `sidebar_position: ${section.fileName.slice(0, 2)}`,
      '---',
      '',
    ].join('\n');

    const finalContent = `${frontMatter}${markdownBody}\n`;
    await fs.writeFile(path.join(outputDocsDir, section.fileName), finalContent, 'utf8');
  }

  await copyImagesFromSource();

  console.log('Manual import complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
