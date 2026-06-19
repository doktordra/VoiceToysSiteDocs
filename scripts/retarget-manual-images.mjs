import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const files = [
  'uputstvo/00-uvod.md',
  'uputstvo/10-opste-informacije.md',
  'uputstvo/20-vibey.md',
  'uputstvo/30-spready.md',
  'uputstvo/40-jumpy.md',
  'uputstvo/50-spacey.md',
  'uputstvo/60-azuriranje.md',
  'uputstvo/80-i-to-nije-sve.md',
  'uputstvo/90-kontakt.md',
  'docs/manual/20-spready.md',
];

for (const relativePath of files) {
  const filePath = resolve(root, relativePath);
  let text = readFileSync(filePath, 'utf8');
  const original = text;

  text = text.replaceAll('](./images/', '](/voice-toys/images/');
  text = text.replaceAll('src="./images/', 'src="/voice-toys/images/');
  text = text.replaceAll("src='./images/", "src='/voice-toys/images/");

  text = text.replaceAll("import zupcanikVibeY from './images/screenshots/sr/zupcanik_VibeY.jpg';\r\n", '');
  text = text.replaceAll("import zupcanikVibeY from './images/screenshots/sr/zupcanik_VibeY.jpg';\n", '');
  text = text.replaceAll("import zupcanikVibeY from './images/screenshots/sr/zupcanik_VibeY.jpg';", '');
  text = text.replaceAll('src={zupcanikVibeY}', 'src="/voice-toys/images/screenshots/sr/zupcanik_VibeY.jpg"');

  if (text !== original) {
    writeFileSync(filePath, text, 'utf8');
    console.log(`updated ${relativePath}`);
  }
}
