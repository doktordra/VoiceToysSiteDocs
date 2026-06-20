import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const projectLogoUrl = useBaseUrl('/img/VoiceToysLOGO.png');
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={styles.heroBackdrop} />
      <div className={clsx('container', styles.heroGrid)}>
        <div className={styles.heroCopy}>
          <div className={styles.heroLogoWrap}>
            <img
              src={projectLogoUrl}
              alt="VoiceToys logo"
              className={styles.heroLogo}
            />
          </div>
          <p className={styles.heroSubtitle}>
            Dobrodošli na centralno mesto gde ćete pronaći sve relevantne podatke, priručnike i uputstva za korišćenje VoiceToys uređaja.
          </p>
          <div className={styles.buttons}>
            <Link className="button button--primary button--lg" to="/docs/manual/uvod">
              Otvori priručnik
            </Link>
            <Link className="button button--secondary button--lg" to="/uputstvo">
              Otvori uputstvo
            </Link>
          </div>
        </div>
      </div>
    </header>
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
      </main>
    </Layout>
  );
}
