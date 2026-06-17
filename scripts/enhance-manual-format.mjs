import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function updateDoc(filePath, config) {
  const abs = path.join(root, filePath);
  let content = await fs.readFile(abs, 'utf8');

  for (const chapter of config.chapters) {
    const re = new RegExp(`^${escapeRe(chapter.from)}\\s*$`, 'm');
    content = content.replace(re, `## **${chapter.label}** {#${chapter.id}}`);
  }

  for (const rule of config.customReplacements || []) {
    content = content.replace(rule.re, rule.to);
  }

  for (const activity of config.activities) {
    const re = new RegExp(`^${escapeRe(activity.from)}\\s*$`, 'm');
    content = content.replace(re, `### **${activity.label}** {#${activity.id}}`);
  }

  if (!content.includes('## **Poglavlja**')) {
    const nav = [
      '## **Poglavlja**',
      ...config.chapters.map((c) => `- **[${c.label}](#${c.id})**`),
      '',
      '## **Aktivnosti**',
      ...config.activities.map((a) => `- **[${a.label}](#${a.id})**`),
      '',
    ].join('\n');

    const frontMatterMatch = content.match(/^---[\s\S]*?---\n/);
    if (frontMatterMatch) {
      const fm = frontMatterMatch[0];
      const rest = content.slice(fm.length);
      content = `${fm}${nav}${rest}`;
    }
  }

  await fs.writeFile(abs, content, 'utf8');
}

async function run() {
  await updateDoc('docs/manual/10-jumpy.md', {
    chapters: [
      {from: 'REAKCIJA', label: 'Reakcija', id: 'poglavlje-reakcija'},
      {from: 'REAKCIJA – SENZOR', label: 'Reakcija - Senzor', id: 'poglavlje-reakcija-senzor'},
      {from: 'IGRA TAPŠANJA', label: 'Igra tapšanja', id: 'poglavlje-igra-tapšanja'},
      {from: 'RAZLIKE', label: 'Razlike', id: 'poglavlje-razlike'},
      {from: 'RITMIČKI OBRAZAC', label: 'Ritmički obrazac', id: 'poglavlje-ritmicki-obrazac'},
    ],
    activities: [
      {from: 'Koja je tvoja boja?', label: 'Koja je tvoja boja?', id: 'aktivnost-koja-je-tvoja-boja'},
      {from: 'Trambolina – koja je tvoja boja?', label: 'Trambolina - koja je tvoja boja?', id: 'aktivnost-trambolina-koja-je-tvoja-boja'},
      {from: 'Blizu - daleko', label: 'Blizu - daleko', id: 'aktivnost-blizu-daleko'},
      {from: 'Individualna igra tapšanja', label: 'Individualna igra tapšanja', id: 'aktivnost-individualna-igra-tapšanja'},
      {from: 'Grupna igra tapšanja', label: 'Grupna igra tapšanja', id: 'aktivnost-grupna-igra-tapšanja'},
      {from: 'Igra tapšanja uz pomoć lopte', label: 'Igra tapšanja uz pomoć lopte', id: 'aktivnost-igra-tapšanja-lopta'},
      {from: 'Prati moj ritam', label: 'Prati moj ritam', id: 'aktivnost-prati-moj-ritam'},
    ],
  });

  await updateDoc('docs/manual/20-spready.md', {
    chapters: [
      {from: 'MIKROFON', label: 'Mikrofon', id: 'poglavlje-mikrofon'},
      {from: 'MEMORIJA', label: 'Memorija', id: 'poglavlje-memorija'},
      {from: 'SPREADY – RUČNO', label: 'SpreadY - Ručno', id: 'poglavlje-spready-rucno'},
    ],
    customReplacements: [
      {re: /^###\s*$\nTrajanje vokala\s*$/m, to: '### **Trajanje vokala** {#aktivnost-trajanje-vokala}'},
    ],
    activities: [
      {from: 'Koja je tvoja boja', label: 'Koja je tvoja boja', id: 'aktivnost-koja-je-tvoja-boja'},
      {from: 'Prepoznaj me', label: 'Prepoznaj me', id: 'aktivnost-prepoznaj-me'},
      {from: 'Osvetli me', label: 'Osvetli me', id: 'aktivnost-osvetli-me'},
      {from: 'Zapamti boju i pojam', label: 'Zapamti boju i pojam', id: 'aktivnost-zapamti-boju-i-pojam'},
      {from: 'Sabiranje', label: 'Sabiranje', id: 'aktivnost-sabiranje'},
      {from: 'Oboji prema modelu', label: 'Oboji prema modelu', id: 'aktivnost-oboji-prema-modelu'},
      {from: 'Brain gym', label: 'Brain gym', id: 'aktivnost-brain-gym'},
      {from: 'Uhvati boju', label: 'Uhvati boju', id: 'aktivnost-uhvati-boju'},
      {from: 'Putevi dana', label: 'Putevi dana', id: 'aktivnost-putevi-dana'},
      {from: 'Od glasa do reči', label: 'Od glasa do reči', id: 'aktivnost-od-glasa-do-reči'},
      {from: 'Sastavi/rastavi reč', label: 'Sastavi-rastavi rec', id: 'aktivnost-sastavi-rastavi-rec'},
      {from: 'Gradimo rečenice', label: 'Gradimo rečenice', id: 'aktivnost-gradimo-rečenice'},
      {from: 'Moj prstić, tvoj stubić', label: 'Moj prstić, tvoj stubić', id: 'aktivnost-moj-prstić-tvoj-stubić'},
      {from: 'Šta kome pripada', label: 'Šta kome pripada', id: 'aktivnost-sta-kome-pripada'},
      {from: 'Lopta pod stopalima', label: 'Lopta pod stopalima', id: 'aktivnost-lopta-pod-stopalima'},
      {from: 'Prati redosled', label: 'Prati redosled', id: 'aktivnost-prati-redosled'},
      {from: 'Dodirni krug', label: 'Dodirni krug', id: 'aktivnost-dodirni-krug'},
    ],
  });

  await updateDoc('docs/manual/30-vibey.md', {
    chapters: [
      {from: 'PREDLOG IGARA:', label: 'Predlog igara', id: 'poglavlje-predlog-igara'},
    ],
    activities: [
      {from: 'Oboji sliku', label: 'Oboji sliku', id: 'aktivnost-oboji-sliku'},
      {from: 'Zovem te', label: 'Zovem te', id: 'aktivnost-zovem-te'},
      {from: 'Pričaj mi priču', label: 'Pričaj mi priču', id: 'aktivnost-pričaj-mi-priču'},
      {from: 'Prati vibraciju', label: 'Prati vibraciju', id: 'aktivnost-prati-vibraciju'},
      {from: 'Pogodi i uradi', label: 'Pogodi i uradi', id: 'aktivnost-pogodi-i-uradi'},
    ],
  });

  await updateDoc('docs/manual/40-spacey.md', {
    chapters: [
      {from: 'TEHNIČKA UPUTSTVA:', label: 'Tehnička uputstva', id: 'poglavlje-tehnicka-uputstva'},
      {from: 'PREDLOG IGARA', label: 'Predlog igara', id: 'poglavlje-predlog-igara'},
    ],
    customReplacements: [
      {re: /^###\s*$\nOpiši zvuk\s*$/m, to: '### **Opiši zvuk** {#aktivnost-opisi-zvuk}'},
    ],
    activities: [
      {from: 'Potraga za zvukom', label: 'Potraga za zvukom', id: 'aktivnost-potraga-za-zvukom'},
      {from: 'Pogodi gde je', label: 'Pogodi gde je', id: 'aktivnost-pogodi-gde-je'},
      {from: 'Umanjeno ili uvećano', label: 'Umanjeno ili uvećano', id: 'aktivnost-umanjeno-uvećano'},
      {from: 'Ko je i šta radi?', label: 'Ko je i sta radi?', id: 'aktivnost-ko-je-i-sta-radi'},
      {from: 'Nacrtaj šta čuješ', label: 'Nacrtaj sta čuješ', id: 'aktivnost-nacrtaj-sta-čuješ'},
      {from: 'Zvučna priča', label: 'Zvučna priča', id: 'aktivnost-zvucna-priča'},
      {from: 'Zajedno pričamo priču', label: 'Zajedno pričamo priču', id: 'aktivnost-zajedno-pričamo-priču'},
      {from: 'Izbaci uljeza', label: 'Izbaci uljeza', id: 'aktivnost-izbaci-uljeza'},
      {from: 'Gde je greška?', label: 'Gde je greška?', id: 'aktivnost-gde-je-greška'},
      {from: 'Prati svoju boju', label: 'Prati svoju boju', id: 'aktivnost-prati-svoju-boju'},
      {from: 'Ulovi mačku', label: 'Ulovi mačku', id: 'aktivnost-ulovi-mačku'},
      {from: 'Moroov refleks', label: 'Moroov refleks', id: 'aktivnost-moroov-refleks'},
    ],
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
