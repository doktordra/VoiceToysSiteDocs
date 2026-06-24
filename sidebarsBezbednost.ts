import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebarsBezbednost: SidebarsConfig = {
  bezbednostSidebar: [
    {
      type: 'link',
      label: 'VoiceToys dokumentacija',
      href: '/',
    },
    {
      type: 'category',
      label: 'Priručnik',
      collapsed: true,
      items: [
        { type: 'link', label: 'Uvod', href: '/docs/manual/uvod' },
        {
          type: 'category',
          label: 'Uređaji',
          collapsed: true,
          items: [
            { type: 'link', label: 'VibeY', href: '/docs/manual/vibey' },
            { type: 'link', label: 'SpreadY', href: '/docs/manual/spready' },
            { type: 'link', label: 'JumpY', href: '/docs/manual/jumpy' },
            { type: 'link', label: 'SpaceY', href: '/docs/manual/spacey' },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Uputstvo',
      collapsed: true,
      items: [
        { type: 'link', label: 'Hvala na poverenju', href: '/uputstvo' },
        {
          type: 'category',
          label: 'Opšte',
          collapsed: true,
          items: [
            { type: 'link', label: 'Opšte informacije', href: '/uputstvo/opste-informacije' },
            { type: 'link', label: 'Mobilna aplikacija', href: '/uputstvo/mobilna-aplikacija' },
          ],
        },
        {
          type: 'category',
          label: 'Uređaji',
          collapsed: true,
          items: [
            { type: 'link', label: 'VibeY', href: '/uputstvo/vibey' },
            { type: 'link', label: 'SpreadY', href: '/uputstvo/spready' },
            { type: 'link', label: 'JumpY', href: '/uputstvo/jumpy' },
            { type: 'link', label: 'SpaceY', href: '/uputstvo/spacey' },
          ],
        },
        {
          type: 'category',
          label: 'Podrška',
          collapsed: true,
          items: [
            { type: 'link', label: 'Ažuriranje', href: '/uputstvo/azuriranje' },
            { type: 'link', label: 'Garancija', href: '/uputstvo/garancija' },
            { type: 'link', label: 'I to nije sve', href: '/uputstvo/i-to-nije-sve' },
            { type: 'link', label: 'Kontakt', href: '/uputstvo/kontakt' },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Sertifikati',
      collapsed: false,
      items: [
        'emc',
        'lvd',
      ],
    },
    {
      type: 'category',
      label: 'Testimonials',
      collapsed: true,
      items: [
        { type: 'link', label: 'Buzganovic (SR) — zapažanja sa tretmana', href: '/Testimonials/Buzganovic%20zapa%C5%BEanja%20sa%20tretmana.pdf' },
        { type: 'link', label: 'Logo-centar (SR) — zapažanja sa tretmana', href: '/Testimonials/Logo-centar%20zapa%C5%BEanja%20sa%20tretmana.pdf' },
        { type: 'link', label: 'OŠ Miloje Pavlović (SR) — pismo preporuke', href: '/Testimonials/O%C5%A0%20Miloje%20Pavlovi%C4%87%20-%20pismo%20preporuke.pdf' },
        { type: 'link', label: 'Оберіг (UK) — recommendation letter', href: '/Testimonials/%D0%9A%D0%97_%D0%9B%D0%9E%D0%A0_%D0%91%D0%B0%D0%B3%D0%B0%D1%82%D0%BE%D0%BF%D1%80%D0%BE%D1%84%D1%96%D0%BB%D1%8C%D0%BD%D0%B8%D0%B8%CC%86_%D0%BD%D0%B0%D0%B2%D1%87%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE_%D1%80%D0%B5%D0%B0%D0%B1%D1%96%D0%BB%D1%96%D1%82%D0%B0%D1%86%D1%96%D0%B8%CC%86%D0%BD%D0%B8%D0%B8%CC%86_%D1%86%D0%B5%D0%BD%D1%82%D1%80_%C2%AB%D0%9E%D0%B1%D0%B5%D1%80%D1%96%D0%B3%C2%BB.pdf' },
      ],
    },
  ],
};

export default sidebarsBezbednost;
