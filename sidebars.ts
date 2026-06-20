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
            {type: 'link', label: 'Reakcija', href: './jumpy#reakcija'},
            {type: 'link', label: 'Reakcija senzor', href: './jumpy#reakcija-senzor'},
            {type: 'link', label: 'Igra tapšanja', href: './jumpy#igra-tap%C5%A1anja'},
            {type: 'link', label: 'Razlike', href: './jumpy#razlike'},
            {type: 'link', label: 'Ritmički obrazac', href: './jumpy#ritmi%C4%8Dki-obrazac'},
          ],
        },
        {
          type: 'category',
          label: 'SpreadY',
          link: {type: 'doc', id: 'manual/spready'},
          items: [
            {type: 'link', label: 'Mikrofon', href: './spready#mikrofon'},
            {type: 'link', label: 'Memorija', href: './spready#memorija'},
            {type: 'link', label: 'Ručno', href: './spready#spready-ru%C4%8Dno'},
          ],
        },
        {
          type: 'category',
          label: 'VibeY',
          link: {type: 'doc', id: 'manual/vibey'},
          items: [
            {type: 'link', label: 'Oboji sliku', href: './vibey#oboji-sliku'},
            {type: 'link', label: 'Zovem te', href: './vibey#zovem-te'},
            {type: 'link', label: 'Pričaj mi priču', href: './vibey#pri%C4%8Daj-mi-pri%C4%8Du'},
            {type: 'link', label: 'Prati vibraciju', href: './vibey#prati-vibraciju'},
            {type: 'link', label: 'Pogodi i uradi', href: './vibey#pogodi-i-uradi'},
          ],
        },
        {
          type: 'category',
          label: 'SpaceY',
          link: {type: 'doc', id: 'manual/spacey'},
          items: [
            {type: 'link', label: 'Potraga za zvukom', href: './spacey#potraga-za-zvukom'},
            {type: 'link', label: 'Pogodi gde je', href: './spacey#pogodi-gde-je'},
            {type: 'link', label: 'Umanjeno ili uvećano', href: './spacey#umanjeno-ili-uve%C4%87ano'},
            {type: 'link', label: 'Ko je i šta radi?', href: './spacey#ko-je-i-%C5%A1ta-radi'},
            {type: 'link', label: 'Opiši zvuk', href: './spacey#opi%C5%A1i-zvuk'},
            {type: 'link', label: 'Nacrtaj šta čuješ', href: './spacey#nacrtaj-%C5%A1ta-%C4%8Duje%C5%A1'},
            {type: 'link', label: 'Zvučna priča', href: './spacey#zvu%C4%8Dna-pri%C4%8Da'},
            {type: 'link', label: 'Zajedno pričamo priču', href: './spacey#zajedno-pri%C4%8Damo-pri%C4%8Du'},
            {type: 'link', label: 'Izbaci uljeza', href: './spacey#izbaci-uljeza'},
            {type: 'link', label: 'Gde je greška?', href: './spacey#gde-je-gre%C5%A1ka'},
            {type: 'link', label: 'Prati svoju boju', href: './spacey#prati-svoju-boju'},
            {type: 'link', label: 'Ulovi mačku', href: './spacey#ulovi-ma%C4%8Dku'},
            {type: 'link', label: 'Moroov refleks', href: './spacey#moroov-refleks'},
          ],
        },
      ],
    },
  ],
};

export default sidebars;
