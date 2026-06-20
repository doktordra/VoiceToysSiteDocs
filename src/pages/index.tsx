import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const projectLogoUrl = useBaseUrl('/img/VoiceToysLOGO.png');
  const manualIntroUrl = useBaseUrl('docs/manual/uvod');
  const manualJumpyUrl = useBaseUrl('docs/manual/jumpy');
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={styles.heroBackdrop} />
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <div className={styles.heroLogoWrap}>
            <img
              src={projectLogoUrl}
              alt="VoiceToys projekat logo"
              className={styles.heroLogo}
            />
          </div>
          <p className={styles.kicker}>VoiceToys Platforma</p>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to={manualIntroUrl}>
              Otvori priručnik
            </Link>
            <Link className="button button--secondary button--lg" to={manualJumpyUrl}>
              Kreni od JumpY
            </Link>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <p className={styles.panelTitle}>Šta je spremno</p>
          <ul className={styles.panelList}>
            <li>Konvertovan priručnik u više Markdown dokumenata</li>
            <li>Strukturisane sekcije: JumpY, SpreadY, VibeY, SpaceY</li>
            <li>Podešena i18n osnova za srpski i engleski</li>
            <li>Pripremljeno za dalji branding i objavu</li>
          </ul>
        </div>
      </div>
    </header>
  );
}

function HomeSections() {
  return (
    <section className={styles.sectionWrap}>
      <div className="container">
        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <h2>Za terapeute</h2>
            <p>
              Svaki uređaj ima izdvojene ciljeve, tehnička uputstva i predloge igara
              koje su lako pretražive i spremne za dalju adaptaciju.
            </p>
          </article>
          <article className={styles.card}>
            <h2>Za timove</h2>
            <p>
              Docusaurus omogućava kontrolisano uređivanje sadržaja, verzionisanje i
              objavu priručnika kao pouzdanog internog ili javnog portala.
            </p>
          </article>
          <article className={styles.card}>
            <h2>Za lokalizaciju</h2>
            <p>
              Struktura je spremna za prevode, tako da možete održavati srpsku i
              englesku verziju paralelno.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function HomeCta() {
  const manualIntroUrl = useBaseUrl('docs/manual/uvod');
  return (
    <section className={styles.ctaSection}>
      <div className={clsx('container', styles.ctaBox)}>
        <div>
          <h2>Spremno za objavu na web</h2>
          <p>
            Dokumentacija je formatirana, razdvojena po temama i prilagođena za
            moderan, višejezičan sajt.
          </p>
        </div>
        <Link
          className="button button--primary button--lg"
          to={manualIntroUrl}>
          Pregledaj dokumentaciju
        </Link>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="VoiceToys priručnik i dokumentacija za uređaje JumpY, SpreadY, VibeY i SpaceY.">
      <HomepageHeader />
      <main>
        <HomeSections />
        <HomeCta />
      </main>
    </Layout>
  );
}
