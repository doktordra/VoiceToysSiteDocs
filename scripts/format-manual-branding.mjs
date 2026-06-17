import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

function escRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceLine(source, from, to) {
  const re = new RegExp(`^[\\t \\u00a0]*${escRe(from)}[\\t \\u00a0]*$`, 'm');
  if (!re.test(source)) return source;
  return source.replace(re, to);
}

function injectNavBlock(source, block) {
  if (source.includes('## Brza Navigacija')) return source;
  const fmMatch = source.match(/^---\n[\s\S]*?\n---\n/);
  if (!fmMatch) return source;
  const idx = fmMatch[0].length;
  return `${source.slice(0, idx)}\n${block}\n${source.slice(idx)}`;
}

async function formatJumpy() {
  const filePath = path.join(root, 'docs/manual/10-jumpy.md');
  let text = await fs.readFile(filePath, 'utf8');

  text = injectNavBlock(
    text,
    [
      '## Brza Navigacija',
      '',
      '### **Poglavlja**',
      '- **[Reakcija](#poglavlje-reakcija)**',
      '- **[Reakcija - senzor](#poglavlje-reakcija-senzor)**',
      '- **[Igra tapšanja](#poglavlje-igra-tapšanja)**',
      '- **[Razlike](#poglavlje-razlike)**',
      '- **[Ritmički obrazac](#poglavlje-ritmicki-obrazac)**',
      '',
      '### **Aktivnosti**',
      '- **[Koja je tvoja boja?](#akt-koja-je-tvoja-boja)**',
      '- **[Trambolina - koja je tvoja boja?](#akt-trambolina-koja-je-tvoja-boja)**',
      '- **[Blizu - daleko](#akt-blizu-daleko)**',
      '- **[Individualna igra tapšanja](#akt-individualna-igra-tapšanja)**',
      '- **[Grupna igra tapšanja](#akt-grupna-igra-tapšanja)**',
      '- **[Igra tapšanja uz pomoć lopte](#akt-igra-tapšanja-uz-pomoć-lopte)**',
      '- **[Prati moj ritam](#akt-prati-moj-ritam)**',
    ].join('\n')
  );

  const replacements = [
    ['REAKCIJA', '## **REAKCIJA** {#poglavlje-reakcija}'],
    ['REAKCIJA – SENZOR', '## **REAKCIJA - SENZOR** {#poglavlje-reakcija-senzor}'],
    ['IGRA TAPŠANJA', '## **IGRA TAPŠANJA** {#poglavlje-igra-tapšanja}'],
    ['RAZLIKE', '## **RAZLIKE** {#poglavlje-razlike}'],
    ['RITMIČKI OBRAZAC', '## **RITMIČKI OBRAZAC** {#poglavlje-ritmicki-obrazac}'],
    ['Koja je tvoja boja?', '### **Koja je tvoja boja?** {#akt-koja-je-tvoja-boja}'],
    ['Trambolina – koja je tvoja boja?', '### **Trambolina - koja je tvoja boja?** {#akt-trambolina-koja-je-tvoja-boja}'],
    ['Blizu - daleko', '### **Blizu - daleko** {#akt-blizu-daleko}'],
    ['Individualna igra tapšanja', '### **Individualna igra tapšanja** {#akt-individualna-igra-tapšanja}'],
    ['Grupna igra tapšanja', '### **Grupna igra tapšanja** {#akt-grupna-igra-tapšanja}'],
    ['Igra tapšanja uz pomoć lopte', '### **Igra tapšanja uz pomoć lopte** {#akt-igra-tapšanja-uz-pomoć-lopte}'],
    ['Prati moj ritam', '### **Prati moj ritam** {#akt-prati-moj-ritam}'],
  ];

  for (const [from, to] of replacements) {
    text = replaceLine(text, from, to);
  }

  await fs.writeFile(filePath, text, 'utf8');
}

async function formatSpready() {
  const filePath = path.join(root, 'docs/manual/20-spready.md');
  let text = await fs.readFile(filePath, 'utf8');

  text = injectNavBlock(
    text,
    [
      '## Brza Navigacija',
      '',
      '### **Poglavlja**',
      '- **[Mikrofon](#poglavlje-mikrofon)**',
      '- **[Memorija](#poglavlje-memorija)**',
      '- **[Ručno](#poglavlje-rucno)**',
      '',
      '### **Aktivnosti**',
      '- **[Koja je tvoja boja](#akt-koja-je-tvoja-boja)**',
      '- **[Prepoznaj me](#akt-prepoznaj-me)**',
      '- **[Osvetli me](#akt-osvetli-me)**',
      '- **[Trajanje vokala](#akt-trajanje-vokala)**',
      '- **[Zapamti boju i pojam](#akt-zapamti-boju-i-pojam)**',
      '- **[Sabiranje](#akt-sabiranje)**',
      '- **[Oboji prema modelu](#akt-oboji-prema-modelu)**',
      '- **[Brain gym](#akt-brain-gym)**',
      '- **[Uhvati boju](#akt-uhvati-boju)**',
      '- **[Putevi dana](#akt-putevi-dana)**',
      '- **[Od glasa do reči](#akt-od-glasa-do-reči)**',
      '- **[Sastavi-rastavi rec](#akt-sastavi-rastavi-rec)**',
      '- **[Gradimo rečenice](#akt-gradimo-rečenice)**',
      '- **[Moj prstić, tvoj stubić](#akt-moj-prstić-tvoj-stubić)**',
      '- **[Šta kome pripada](#akt-sta-kome-pripada)**',
      '- **[Lopta pod stopalima](#akt-lopta-pod-stopalima)**',
      '- **[Prati redosled](#akt-prati-redosled)**',
      '- **[Dodirni krug](#akt-dodirni-krug)**',
    ].join('\n')
  );

  const replacements = [
    ['MIKROFON', '## **MIKROFON** {#poglavlje-mikrofon}'],
    ['MEMORIJA', '## **MEMORIJA** {#poglavlje-memorija}'],
    ['SPREADY – RUČNO', '## **SPREADY - RUČNO** {#poglavlje-rucno}'],
    ['Koja je tvoja boja', '### **Koja je tvoja boja** {#akt-koja-je-tvoja-boja}'],
    ['Prepoznaj me', '### **Prepoznaj me** {#akt-prepoznaj-me}'],
    ['Osvetli me', '### **Osvetli me** {#akt-osvetli-me}'],
    ['Trajanje vokala', '### **Trajanje vokala** {#akt-trajanje-vokala}'],
    ['Zapamti boju i pojam', '### **Zapamti boju i pojam** {#akt-zapamti-boju-i-pojam}'],
    ['Sabiranje', '### **Sabiranje** {#akt-sabiranje}'],
    ['Oboji prema modelu', '### **Oboji prema modelu** {#akt-oboji-prema-modelu}'],
    ['Brain gym', '### **Brain gym** {#akt-brain-gym}'],
    ['Uhvati boju', '### **Uhvati boju** {#akt-uhvati-boju}'],
    ['Putevi dana', '### **Putevi dana** {#akt-putevi-dana}'],
    ['Od glasa do reči', '### **Od glasa do reči** {#akt-od-glasa-do-reči}'],
    ['Sastavi/rastavi reč', '### **Sastavi/rastavi rec** {#akt-sastavi-rastavi-rec}'],
    ['Gradimo rečenice', '### **Gradimo rečenice** {#akt-gradimo-rečenice}'],
    ['Moj prstić, tvoj stubić', '### **Moj prstić, tvoj stubić** {#akt-moj-prstić-tvoj-stubić}'],
    ['Šta kome pripada', '### **Šta kome pripada** {#akt-sta-kome-pripada}'],
    ['Lopta pod stopalima', '### **Lopta pod stopalima** {#akt-lopta-pod-stopalima}'],
    ['Prati redosled', '### **Prati redosled** {#akt-prati-redosled}'],
    ['Dodirni krug', '### **Dodirni krug** {#akt-dodirni-krug}'],
  ];

  for (const [from, to] of replacements) {
    text = replaceLine(text, from, to);
  }

  await fs.writeFile(filePath, text, 'utf8');
}

async function formatVibey() {
  const filePath = path.join(root, 'docs/manual/30-vibey.md');
  let text = await fs.readFile(filePath, 'utf8');

  text = injectNavBlock(
    text,
    [
      '## Brza Navigacija',
      '',
      '### **Aktivnosti**',
      '- **[Oboji sliku](#akt-oboji-sliku)**',
      '- **[Zovem te](#akt-zovem-te)**',
      '- **[Pričaj mi priču](#akt-pričaj-mi-priču)**',
      '- **[Prati vibraciju](#akt-prati-vibraciju)**',
      '- **[Pogodi i uradi](#akt-pogodi-i-uradi)**',
    ].join('\n')
  );

  const replacements = [
    ['Oboji sliku', '### **Oboji sliku** {#akt-oboji-sliku}'],
    ['Zovem te', '### **Zovem te** {#akt-zovem-te}'],
    ['Pričaj mi priču', '### **Pričaj mi priču** {#akt-pričaj-mi-priču}'],
    ['Prati vibraciju', '### **Prati vibraciju** {#akt-prati-vibraciju}'],
    ['Pogodi i uradi', '### **Pogodi i uradi** {#akt-pogodi-i-uradi}'],
  ];

  for (const [from, to] of replacements) {
    text = replaceLine(text, from, to);
  }

  await fs.writeFile(filePath, text, 'utf8');
}

async function formatSpacey() {
  const filePath = path.join(root, 'docs/manual/40-spacey.md');
  let text = await fs.readFile(filePath, 'utf8');

  text = injectNavBlock(
    text,
    [
      '## Brza Navigacija',
      '',
      '### **Aktivnosti**',
      '- **[Potraga za zvukom](#akt-potraga-za-zvukom)**',
      '- **[Pogodi gde je](#akt-pogodi-gde-je)**',
      '- **[Umanjeno ili uvećano](#akt-umanjeno-ili-uvećano)**',
      '- **[Ko je i sta radi?](#akt-ko-je-i-sta-radi)**',
      '- **[Opiši zvuk](#akt-opisi-zvuk)**',
      '- **[Nacrtaj sta čuješ](#akt-nacrtaj-sta-čuješ)**',
      '- **[Zvučna priča](#akt-zvucna-priča)**',
      '- **[Zajedno pričamo priču](#akt-zajedno-pričamo-priču)**',
      '- **[Izbaci uljeza](#akt-izbaci-uljeza)**',
      '- **[Gde je greška?](#akt-gde-je-greška)**',
      '- **[Prati svoju boju](#akt-prati-svoju-boju)**',
      '- **[Ulovi mačku](#akt-ulovi-mačku)**',
      '- **[Moroov refleks](#akt-moroov-refleks)**',
    ].join('\n')
  );

  const replacements = [
    ['Potraga za zvukom', '### **Potraga za zvukom** {#akt-potraga-za-zvukom}'],
    ['Pogodi gde je', '### **Pogodi gde je** {#akt-pogodi-gde-je}'],
    ['Umanjeno ili uvećano', '### **Umanjeno ili uvećano** {#akt-umanjeno-ili-uvećano}'],
    ['Ko je i šta radi?', '### **Ko je i sta radi?** {#akt-ko-je-i-sta-radi}'],
    ['Opiši zvuk', '### **Opiši zvuk** {#akt-opisi-zvuk}'],
    ['Nacrtaj šta čuješ', '### **Nacrtaj sta čuješ** {#akt-nacrtaj-sta-čuješ}'],
    ['Zvučna priča', '### **Zvučna priča** {#akt-zvucna-priča}'],
    ['Zajedno pričamo priču', '### **Zajedno pričamo priču** {#akt-zajedno-pričamo-priču}'],
    ['Izbaci uljeza', '### **Izbaci uljeza** {#akt-izbaci-uljeza}'],
    ['Gde je greška?', '### **Gde je greška?** {#akt-gde-je-greška}'],
    ['Prati svoju boju', '### **Prati svoju boju** {#akt-prati-svoju-boju}'],
    ['Ulovi mačku', '### **Ulovi mačku** {#akt-ulovi-mačku}'],
    ['Moroov refleks', '### **Moroov refleks** {#akt-moroov-refleks}'],
  ];

  for (const [from, to] of replacements) {
    text = replaceLine(text, from, to);
  }

  await fs.writeFile(filePath, text, 'utf8');
}

async function main() {
  await formatJumpy();
  await formatSpready();
  await formatVibey();
  await formatSpacey();
  console.log('Formatting complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
