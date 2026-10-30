// Kategorija "Preporuke i iskustva" — zajednička za sve sidebar-ove.
//
// Docusaurus prevodi samo natpise u sidebar-u (i18n/<locale>/.../current.json),
// ne i linkove. Zato se ovde, prema jeziku koji se trenutno build-uje
// (process.env.DOCUSAURUS_CURRENT_LOCALE), bira koji PDF-ovi se prikazuju:
//   - de: nemački prevodi (static/Testimonials/de/) + originali u podkategoriji
//   - ostali jezici: originalni dokumenti, kao i do sada
//
// Natpisi za ne-nemačke jezike moraju ostati identični, jer su ključevi
// postojećih prevoda u current.json vezani za njih.

const ORIGINALS = [
  { label: 'Logomedica (SR) — pismo preporuke', file: 'Logomedica1.pdf' },
  { label: 'Goran Petrušev (MK) — preporuka', file: 'Goran_Petrusev1.pdf' },
  { label: 'Buzganovic (SR) — zapažanja sa tretmana', file: 'Buzganovic1.pdf' },
  { label: 'Logo-centar (SR) — zapažanja sa tretmana', file: 'Logo-centar1.pdf' },
  { label: 'OŠ Miloje Pavlović (SR) — pismo preporuke', file: 'OS_MilojePavlovic1.pdf' },
  { label: 'Оберіг (UK) — recommendation letter', file: 'KZ_LOR1.pdf' },
];

const GERMAN = [
  { label: 'Logomedica (SR) — Empfehlung', file: 'Logomedica1.pdf', original: 'Logomedica — Original (Serbisch)' },
  { label: 'Goran Petrušev (MK) — Empfehlung', file: 'Goran_Petrusev1.pdf', original: 'Goran Petrušev — Original (Serbisch)' },
  { label: 'Buzganović (SR) — Beobachtungen aus der Behandlung', file: 'Buzganovic1.pdf', original: 'Buzganović — Original (Serbisch)' },
  { label: 'Logo-centar (SR) — Beobachtungen aus der Behandlung', file: 'Logo-centar1.pdf', original: 'Logo-centar — Original (Serbisch)' },
  { label: 'Grundschule Miloje Pavlović (SR) — Empfehlungsschreiben', file: 'OS_MilojePavlovic1.pdf', original: 'Grundschule Miloje Pavlović — Original (Serbisch)' },
  { label: 'Оберіг (UA) — Analytischer Bericht', file: 'KZ_LOR1.pdf', original: 'Оберіг — Original (Ukrainisch)' },
];

const original = (file: string) => `pathname:///Testimonials/${file}`;
const german = (file: string) => `pathname:///Testimonials/de/${file.replace(/\.pdf$/, '-DE.pdf')}`;

export function testimonialsCategory() {
  const locale = process.env.DOCUSAURUS_CURRENT_LOCALE;

  if (locale === 'de') {
    return {
      type: 'category' as const,
      label: 'Preporuke i iskustva',
      collapsed: true,
      items: [
        ...GERMAN.map((d) => ({ type: 'link' as const, label: d.label, href: german(d.file) })),
        {
          type: 'category' as const,
          label: 'Originaldokumente',
          collapsed: true,
          items: GERMAN.map((d) => ({ type: 'link' as const, label: d.original, href: original(d.file) })),
        },
      ],
    };
  }

  return {
    type: 'category' as const,
    label: 'Preporuke i iskustva',
    collapsed: true,
    items: ORIGINALS.map((d) => ({ type: 'link' as const, label: d.label, href: original(d.file) })),
  };
}
