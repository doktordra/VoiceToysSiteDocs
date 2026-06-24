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
          key: 'manual-devices',
          collapsed: true,
          items: [
            { type: 'link', label: 'VibeY', href: '/docs/manual/vibey', key: 'manual-vibey' },
            { type: 'link', label: 'SpreadY', href: '/docs/manual/spready', key: 'manual-spready' },
            { type: 'link', label: 'JumpY', href: '/docs/manual/jumpy', key: 'manual-jumpy' },
            { type: 'link', label: 'SpaceY', href: '/docs/manual/spacey', key: 'manual-spacey' },
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
          key: 'uputstvo-devices',
          collapsed: true,
          items: [
            { type: 'link', label: 'VibeY', href: '/uputstvo/vibey', key: 'uputstvo-vibey' },
            { type: 'link', label: 'SpreadY', href: '/uputstvo/spready', key: 'uputstvo-spready' },
            { type: 'link', label: 'JumpY', href: '/uputstvo/jumpy', key: 'uputstvo-jumpy' },
            { type: 'link', label: 'SpaceY', href: '/uputstvo/spacey', key: 'uputstvo-spacey' },
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
        { type: 'link', label: 'Buzganovic (SR) — zapažanja sa tretmana', href: 'pathname:///Testimonials/Buzganovic1.pdf' },
        { type: 'link', label: 'Logo-centar (SR) — zapažanja sa tretmana', href: 'pathname:///Testimonials/Logo-centar1.pdf' },
        { type: 'link', label: 'OŠ Miloje Pavlović (SR) — pismo preporuke', href: 'pathname:///Testimonials/OS_MilojePavlovic1.pdf' },
        { type: 'link', label: 'Оберіг (UK) — recommendation letter', href: 'pathname:///Testimonials/KZ_LOR1.pdf' },
      ],
    },
  ],
};

export default sidebarsBezbednost;
