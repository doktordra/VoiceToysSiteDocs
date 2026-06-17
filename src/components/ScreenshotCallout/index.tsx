import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type CalloutItem = {
  label: string;
  description?: string;
};

type Props = {
  src: string;
  alt: string;
  title?: string;
  items: CalloutItem[];
};

export default function ScreenshotCallout({src, alt, title, items}: Props): React.JSX.Element {
  return (
    <figure className={styles.figure}>
      <img className={styles.image} src={src} alt={alt} />
      <figcaption className={styles.caption}>
        {title ? <div className={styles.title}>{title}</div> : null}
        <ol className={styles.list}>
          {items.map((item) => (
            <li key={item.label} className={styles.item}>
              <span className={styles.label}>{item.label}</span>
              {item.description ? <span className={clsx(styles.description)}>{item.description}</span> : null}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}