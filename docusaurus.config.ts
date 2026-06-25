import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'VoiceToys Priručnik',
  tagline: 'Interaktivni priručnik za terapeute i edukatore',
  favicon: 'img/y-favicon-32x32.png',

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

  // Use a single, shared browser-storage namespace across all locales so that
  // the dark/light mode (and other UI prefs) are GLOBAL, not remembered per
  // language. With future.v4 the namespace would otherwise default to a hash of
  // url + (localized) baseUrl, giving a different `theme` key for /, /en/, /de/.
  storage: {
    type: 'localStorage',
    namespace: false,
  },

  // Set the production url of your site here
  url: 'https://docs.voicetoys.rs',       // Vaš glavni domen
  baseUrl: '/',            // Kosa crta na početku i kraju

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
      '@docusaurus/plugin-content-docs',
      {
        id: 'bezbednost',
        path: 'bezbednost',
        routeBasePath: 'bezbednost',
        sidebarPath: './sidebarsBezbednost.ts',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'pregled',
        path: 'nav-preview',
        routeBasePath: '/',
        sidebarPath: './sidebarsPregled.ts',
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
    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },
    image: 'img/Ylogo.jpg',
    metadata: [
      {
        property: 'og:image',
        content: 'https://docs.voicetoys.rs/img/Ylogo.jpg',
      },
      {
        property: 'og:image:type',
        content: 'image/jpeg',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:image',
        content: 'https://docs.voicetoys.rs/img/Ylogo.jpg',
      },
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      logo: {
        alt: 'VoiceToys Logo',
        src: '/img/VoiceToysLOGO.png',
        srcDark: '/img/VoiceToysLogoBELI.png',
      },
      items: [
        {
          type: 'search',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          type: 'html',
          position: 'right',
          value: '<button onclick="window.print()" class="clean-btn navbar-print-btn" title="Štampaj ovu stranu" aria-label="Štampaj"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg></button>',
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
