# VoiceToysSiteDocs

Live site: https://doktordra.github.io/VoiceToysSiteDocs/

# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm ci
```

## Local Development

```bash
npm run start -- --host 0.0.0.0 --port 3001
```

This command starts a local development server. Most changes are reflected live without restarting.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Deployment to GitHub Pages is automated via GitHub Actions.

```bash
git push origin main
```

The workflow runs `npm ci`, builds the site, and publishes `build/` to GitHub Pages.

## Prevođenje i višejezičnost (i18n)

Sajt koristi Docusaurus i18n. Podrazumevani jezik je `sr`, a podržani su i `en` i `de`
(definisano u `docusaurus.config.ts` pod `i18n.locales`).

### Gde žive prevodi

Prevedeni sadržaj se nalazi u `i18n/<locale>/<plugin>/current/`. Svaki sadržajni
plugin ima svoj folder:

| Sekcija (izvor)         | Plugin folder u `i18n/<locale>/`                     |
| ----------------------- | ---------------------------------------------------- |
| `docs/` (Priručnik)     | `docusaurus-plugin-content-docs/current/`            |
| `uputstvo/`             | `docusaurus-plugin-content-docs-uputstvo/current/`   |
| `bezbednost/`           | `docusaurus-plugin-content-docs-bezbednost/current/` |
| `nav-preview/` (početna)| `docusaurus-plugin-content-docs-pregled/current/`    |

Putanja prevoda mora da odgovara putanji izvora. Npr. izvor `docs/manual/00-uvod.md`
ide u `i18n/en/docusaurus-plugin-content-docs/current/manual/00-uvod.md`.

> **Ekstenzija mora da se poklapa.** Ako je izvor `.mdx`, i prevod mora biti `.mdx`
> (npr. `nav-preview/index.mdx` → `.../current/index.mdx`, NE `index.md`). Ako se
> ekstenzije razlikuju, Docusaurus ignoriše prevod i tiho servira izvorni (srpski)
> sadržaj — bez greške u build-u.

> Frontmatter `id`, `slug` i `sidebar_position` moraju ostati identični izvoru —
> prevodi se samo `title` i tekst. Slike sa apsolutnim putanjama (npr. `/img/manual/...`)
> ostaju nepromenjene.

> **MDX sa `import`-om** (npr. naslovna `nav-preview/index.mdx` koja uvozi
> `./index.module.css`): u prevodu putanja importa mora da se prilagodi dubini foldera.
> Iz `i18n/<locale>/<plugin>/current/` do korena treba 4 nivoa naviše, npr.
> `import styles from '../../../../nav-preview/index.module.css';`. Vrednosti
> `data-*` atributa (npr. `data-color`) ostaju identične izvoru da bi stilizacija radila.

> **Kada se izvor promeni strukturno**, postojeći prevod postaje zastareo i mora se
> ponovo napisati prema novoj strukturi izvora (npr. naslovna je prešla sa običnog
> markdowna na kartice — stari `.md` prevod više nije odgovarao).

### Prevod UI labela (meni, footer, sidebar kategorije)

Labele menija/footer-a/sidebar kategorija se prevode kroz JSON fajlove. Generiši ih:

```bash
npx docusaurus write-translations --locale en
npx docusaurus write-translations --locale de
```

Zatim prevedi vrednosti polja `message` u generisanim JSON fajlovima. Za srpske
labele koristi pomoćnu skriptu sa rečnikom prevoda:

```bash
node scripts/translate-ui.mjs
```

`code.json` (ugrađene tema-labele kao „Next”/„Previous”) Docusaurus popunjava
automatski iz svojih prevoda — ne treba ga ručno menjati.

> **Globalni `title` i `tagline`** iz `docusaurus.config.ts` se NE prevode po jeziku —
> Docusaurus ih koristi kao isti tekst za sve locale-e (vidljivi kao sufiks u tabu
> browsera, npr. `… | VoiceToys Priručnik`). Ako želiš neutralan brend na svim jezicima,
> postavi `title` na npr. `VoiceToys`. Ovo se ne rešava kroz `i18n/` JSON fajlove.

> Dugme za štampu u navbar-u je `type: 'html'` u configu (hardkodiran `title`/`aria-label`)
> i ne prevodi se kroz `i18n/` JSON.

### Dodavanje novog jezika

1. Dodaj kod jezika u `i18n.locales` u `docusaurus.config.ts`.
2. Pokreni `npx docusaurus write-translations --locale <kod>`.
3. Iskopiraj/prevedi sadržajne `.md`/`.mdx` fajlove u odgovarajuće
   `i18n/<kod>/<plugin>/current/` foldere (vidi tabelu iznad). Zadrži istu
   ekstenziju i istu putanju kao izvor; prilagodi `import` putanje u MDX fajlovima.
4. Prevedi UI labele (`scripts/translate-ui.mjs` ili ručno).
5. Proveri build: `npm run build`, pa pokreni `npx docusaurus serve` i potraži
   zaostali srpski tekst (npr. `grep -R "Priručnik" build/<kod>/`).
