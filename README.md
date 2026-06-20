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
