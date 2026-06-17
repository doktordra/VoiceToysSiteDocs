import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'manual/uvod',
    {
      type: 'category',
      label: 'VoiceToys uređaji',
      items: [
        {
          type: 'category',
          label: 'JumpY',
          link: {type: 'doc', id: 'manual/jumpy'},
          items: [
            {type: 'link', label: 'Reakcija', href: '/docs/manual/jumpy#reakcija'},
            {type: 'link', label: 'Reakcija senzor', href: '/docs/manual/jumpy#reakcija-senzor'},
            {type: 'link', label: 'Igra tapšanja', href: '/docs/manual/jumpy#igra-tap%C5%A1anja'},
            {type: 'link', label: 'Razlike', href: '/docs/manual/jumpy#razlike'},
            {type: 'link', label: 'Ritmički obrazac', href: '/docs/manual/jumpy#ritmi%C4%8Dki-obrazac'},
          ],
        },
        {
          type: 'category',
          label: 'SpreadY',
          link: {type: 'doc', id: 'manual/spready'},
          items: [
            {type: 'link', label: 'Mikrofon', href: '/docs/manual/spready#mikrofon'},
            {type: 'link', label: 'Memorija', href: '/docs/manual/spready#memorija'},
            {type: 'link', label: 'Ručno', href: '/docs/manual/spready#spready-ru%C4%8Dno'},
          ],
        },
        {
          type: 'category',
          label: 'VibeY',
          link: {type: 'doc', id: 'manual/vibey'},
          items: [
            {type: 'link', label: 'Oboji sliku', href: '/docs/manual/vibey#oboji-sliku'},
            {type: 'link', label: 'Zovem te', href: '/docs/manual/vibey#zovem-te'},
            {type: 'link', label: 'Pričaj mi priču', href: '/docs/manual/vibey#pri%C4%8Daj-mi-pri%C4%8Du'},
            {type: 'link', label: 'Prati vibraciju', href: '/docs/manual/vibey#prati-vibraciju'},
            {type: 'link', label: 'Pogodi i uradi', href: '/docs/manual/vibey#pogodi-i-uradi'},
          ],
        },
        {
          type: 'category',
          label: 'SpaceY',
          link: {type: 'doc', id: 'manual/spacey'},
          items: [
            {type: 'link', label: 'Potraga za zvukom', href: '/docs/manual/spacey#potraga-za-zvukom'},
            {type: 'link', label: 'Pogodi gde je', href: '/docs/manual/spacey#pogodi-gde-je'},
            {type: 'link', label: 'Umanjeno ili uvećano', href: '/docs/manual/spacey#umanjeno-ili-uve%C4%87ano'},
            {type: 'link', label: 'Ko je i šta radi?', href: '/docs/manual/spacey#ko-je-i-%C5%A1ta-radi'},
            {type: 'link', label: 'Opiši zvuk', href: '/docs/manual/spacey#opi%C5%A1i-zvuk'},
            {type: 'link', label: 'Nacrtaj šta čuješ', href: '/docs/manual/spacey#nacrtaj-%C5%A1ta-%C4%8Duje%C5%A1'},
            {type: 'link', label: 'Zvučna priča', href: '/docs/manual/spacey#zvu%C4%8Dna-pri%C4%8Da'},
            {type: 'link', label: 'Zajedno pričamo priču', href: '/docs/manual/spacey#zajedno-pri%C4%8Damo-pri%C4%8Du'},
            {type: 'link', label: 'Izbaci uljeza', href: '/docs/manual/spacey#izbaci-uljeza'},
            {type: 'link', label: 'Gde je greška?', href: '/docs/manual/spacey#gde-je-gre%C5%A1ka'},
            {type: 'link', label: 'Prati svoju boju', href: '/docs/manual/spacey#prati-svoju-boju'},
            {type: 'link', label: 'Ulovi mačku', href: '/docs/manual/spacey#ulovi-ma%C4%8Dku'},
            {type: 'link', label: 'Moroov refleks', href: '/docs/manual/spacey#moroov-refleks'},
          ],
        },
      ],
    },
  ],
};

export default sidebars;
