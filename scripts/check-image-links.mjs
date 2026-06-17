#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['uputstvo', 'docs/manual'];
const IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(abs));
    } else if (entry.isFile() && abs.endsWith('.md')) {
      files.push(abs);
    }
  }
  return files;
}

function isExternalLink(link) {
  return /^(https?:|data:|#)/i.test(link);
}

const markdownFiles = TARGET_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
const missing = [];

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = IMAGE_RE.exec(content)) !== null) {
    const rawLink = match[1].trim();
    if (!rawLink || isExternalLink(rawLink)) continue;

    // Strip optional title if present: path/to/img.png "title"
    const link = rawLink.split(/\s+"/)[0];
    const resolved = path.resolve(path.dirname(file), link);

    if (!fs.existsSync(resolved)) {
      missing.push({ file: path.relative(ROOT, file), link });
    }
  }
}

if (missing.length === 0) {
  console.log('OK: all markdown image links resolve.');
  process.exit(0);
}

console.error('Missing image references found:');
for (const item of missing) {
  console.error(`- ${item.file} -> ${item.link}`);
}
process.exit(1);
