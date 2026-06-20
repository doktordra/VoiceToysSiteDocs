import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'VoiceToys Priručnik',
  tagline: 'Interaktivni priručnik za terapeute i edukatore',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
    // Keep v4 flags, but opt out of Faster/Rspack to avoid local dev instability.
    faster: {
      swcJsLoader: false,
      swcJsMinimizer: false,
      swcHtmlMinimizer: false,
      lightningCssMinimizer: false,
      mdxCrossCompilerCache: false,
      rspackBundler: false,
      rspackPersistentCache: false,
      ssgWorkerThreads: false,
      gitEagerVcs: false,
    },
  },

  // Set the production url of your site here
  url: 'https://www.voicetoys.rs',       // Vaš glavni domen
  baseUrl: '/docs/',            // Kosa crta na početku i kraju

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'voicetoys',
  projectName: 'prirucnik',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'ignore',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'sr',
    locales: ['sr', 'en', 'de'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'uputstvo',
        path: 'uputstvo',
        routeBasePath: 'uputstvo',
        sidebarPath: './sidebarsUputstvo.ts',
      },
    ],
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexDocs: true,
        indexPages: true,
        indexBlog: false,
        language: ['en', 'de'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  clientModules: ['./src/client/mobileNavbarFix.js'],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'VoiceToys Logo',
        src: '/img/VoiceToysLOGO.png',
      },
      items: [
        {
          type: 'dropdown',
          position: 'left',
          label: 'Priručnik',
          items: [
            {
              label: 'Uvod',
              to: '/docs/manual/uvod',
            },
            {
              label: 'VibeY',
              to: '/docs/manual/vibey',
            },
            {
              label: 'SpreadY',
              to: '/docs/manual/spready',
            },
            {
              label: 'JumpY',
              to: '/docs/manual/jumpy',
            },
            {
              label: 'SpaceY',
              to: '/docs/manual/spacey',
            },
          ],
        },
        {
          type: 'dropdown',
          position: 'left',
          label: 'Uputstvo',
          items: [
            {
              label: 'Dobrodošli',
              to: '/uputstvo',
            },
            {
              label: 'Opšte informacije',
              to: '/uputstvo/opste-informacije',
            },
            {
              label: 'VibeY',
              to: '/uputstvo/vibey',
            },
            {
              label: 'SpreadY',
              to: '/uputstvo/spready',
            },
            {
              label: 'JumpY',
              to: '/uputstvo/jumpy',
            },
            {
              label: 'SpaceY',
              to: '/uputstvo/spacey',
            },
            {
              label: 'Ažuriranje',
              to: '/uputstvo/azuriranje',
            },
            {
              label: 'Garancija',
              to: '/uputstvo/garancija',
            },
            {
              label: 'I to nije sve',
              to: '/uputstvo/i-to-nije-sve',
            },
            {
              label: 'Kontakt',
              to: '/uputstvo/kontakt',
            },
          ],
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Dokumentacija',
          items: [
            {
              label: 'Priručnik (Uvod)',
              to: '/docs/manual/uvod',
            },
            {
              label: 'Uputstvo (Početak)',
              to: '/uputstvo',
            },
          ],
        },
        {
          title: 'Brza Navigacija',
          items: [
            {
              label: 'Početna',
              to: '/',
            },
            {
              label: 'Priručnik',
              to: '/docs/manual/uvod',
            },
            {
              label: 'Uputstvo',
              to: '/uputstvo',
            },
            {
              label: 'Pretraga',
              to: '/search',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} VoiceToys. Sva prava zadržana.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
