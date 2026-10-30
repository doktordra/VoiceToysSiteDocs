import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import { testimonialsCategory } from './sidebarsTestimonials';

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
    testimonialsCategory(),
  ],
};

export default sidebarsUputstvo;
