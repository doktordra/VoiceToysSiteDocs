import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebarsUputstvo: SidebarsConfig = {
  uputstvoSidebar: [
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
      collapsed: false,
      items: [
        'uvod',
        {
          type: 'category',
          label: 'Opšte',
          collapsed: false,
          items: [
            'opste-informacije',
            'mobilna-aplikacija',
          ],
        },
        {
          type: 'category',
          label: 'Uređaji',
          key: 'uputstvo-devices',
          collapsed: false,
          items: [
            'vibey',
            'spready',
            'jumpy',
            'spacey',
          ],
        },
        {
          type: 'category',
          label: 'Podrška',
          collapsed: false,
          items: [
            'azuriranje',
            'garancija',
            'i-to-nije-sve',
            'kontakt',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Sertifikati',
      collapsed: true,
      items: [
        { type: 'link', label: 'EMC', href: '/bezbednost/emc' },
        { type: 'link', label: 'LVD', href: '/bezbednost/lvd' },
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

export default sidebarsUputstvo;
