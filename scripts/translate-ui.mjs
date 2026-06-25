// Translates Docusaurus UI JSON (sidebar labels, footer) from Serbian source
// values into EN/DE by matching the `message` field against a dictionary.
// Usage: node scripts/translate-ui.mjs
import fs from 'node:fs';
import path from 'node:path';

const DICT = {
  en: {
    'Priručnik': 'Manual',
    'Uređaji': 'Devices',
    'Uputstvo': 'Guide',
    'Opšte': 'General',
    'Podrška': 'Support',
    'Sertifikati': 'Certificates',
    'VoiceToys dokumentacija': 'VoiceToys Documentation',
    'Uvod': 'Introduction',
    'Hvala na poverenju': 'Thank You for Your Trust',
    'Opšte informacije': 'General Information',
    'Mobilna aplikacija': 'Mobile Application',
    'Ažuriranje': 'Updates',
    'Garancija': 'Warranty',
    'I to nije sve': "And That's Not All",
    'Kontakt': 'Contact',
    // Footer
    'Dokumentacija': 'Documentation',
    'Brza Navigacija': 'Quick Navigation',
    'Priručnik (Uvod)': 'Manual (Introduction)',
    'Uputstvo (Početak)': 'Guide (Getting Started)',
    'Početna': 'Home',
    'Pretraga': 'Search',
    'Copyright © 2026 VoiceToys. Sva prava zadržana.':
      'Copyright © 2026 VoiceToys. All rights reserved.',
    // Testimonials
    'Buzganovic (SR) — zapažanja sa tretmana':
      'Buzganović (SR) — treatment notes',
    'Logo-centar (SR) — zapažanja sa tretmana':
      'Logo-centar (SR) — treatment notes',
    'OŠ Miloje Pavlović (SR) — pismo preporuke':
      'Miloje Pavlović Primary School (SR) — recommendation letter',
    'Оберіг (UK) — recommendation letter':
      'Оберіг (UA) — recommendation letter',
  },
  de: {
    'Priručnik': 'Handbuch',
    'Uređaji': 'Geräte',
    'Uputstvo': 'Anleitung',
    'Opšte': 'Allgemein',
    'Podrška': 'Support',
    'Sertifikati': 'Zertifikate',
    'VoiceToys dokumentacija': 'VoiceToys Dokumentation',
    'Uvod': 'Einführung',
    'Hvala na poverenju': 'Danke für Ihr Vertrauen',
    'Opšte informacije': 'Allgemeine Informationen',
    'Mobilna aplikacija': 'Mobile App',
    'Ažuriranje': 'Aktualisierung',
    'Garancija': 'Garantie',
    'I to nije sve': 'Und das ist noch nicht alles',
    'Kontakt': 'Kontakt',
    // Footer
    'Dokumentacija': 'Dokumentation',
    'Brza Navigacija': 'Schnellnavigation',
    'Priručnik (Uvod)': 'Handbuch (Einführung)',
    'Uputstvo (Početak)': 'Anleitung (Erste Schritte)',
    'Početna': 'Startseite',
    'Pretraga': 'Suche',
    'Copyright © 2026 VoiceToys. Sva prava zadržana.':
      'Copyright © 2026 VoiceToys. Alle Rechte vorbehalten.',
    // Testimonials
    'Buzganovic (SR) — zapažanja sa tretmana':
      'Buzganović (SR) — Behandlungsnotizen',
    'Logo-centar (SR) — zapažanja sa tretmana':
      'Logo-centar (SR) — Behandlungsnotizen',
    'OŠ Miloje Pavlović (SR) — pismo preporuke':
      'Grundschule Miloje Pavlović (SR) — Empfehlungsschreiben',
    'Оберіг (UK) — recommendation letter':
      'Оберіг (UA) — Empfehlungsschreiben',
  },
};

// Files (relative to i18n/<locale>/) whose `message` values should be translated.
const FILES = [
  'docusaurus-theme-classic/footer.json',
  'docusaurus-plugin-content-docs/current.json',
  'docusaurus-plugin-content-docs-uputstvo/current.json',
  'docusaurus-plugin-content-docs-pregled/current.json',
  'docusaurus-plugin-content-docs-bezbednost/current.json',
];

const root = process.cwd();
let changedTotal = 0;

for (const locale of ['en', 'de']) {
  const dict = DICT[locale];
  for (const rel of FILES) {
    const file = path.join(root, 'i18n', locale, rel);
    if (!fs.existsSync(file)) continue;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let changed = 0;
    for (const key of Object.keys(data)) {
      const entry = data[key];
      if (!entry || typeof entry.message !== 'string') continue;
      const src = entry.message;
      if (Object.prototype.hasOwnProperty.call(dict, src)) {
        const translated = dict[src];
        if (translated !== src) {
          entry.message = translated;
          changed++;
        }
      }
    }
    if (changed > 0) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      changedTotal += changed;
      console.log(`[${locale}] ${rel}: ${changed} strings translated`);
    } else {
      console.log(`[${locale}] ${rel}: no changes`);
    }
  }
}

console.log(`Done. ${changedTotal} total strings translated.`);
