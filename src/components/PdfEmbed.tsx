import React, {useMemo} from 'react';

import styles from './PdfEmbed.module.css';

type PdfEmbedProps = {
  src: string;
  title: string;
};

function withDefaultPdfView(src: string): string {
  const hashIndex = src.indexOf('#');
  if (hashIndex === -1) {
    return `${src}#page=1&zoom=page-fit`;
  }

  const base = src.slice(0, hashIndex);
  const hash = src.slice(hashIndex + 1);
  const hasZoom = /(^|&)zoom=/.test(hash);
  const hasPage = /(^|&)page=/.test(hash);

  const extra: string[] = [];
  if (!hasPage) extra.push('page=1');
  if (!hasZoom) extra.push('zoom=page-fit');

  if (extra.length === 0) {
    return src;
  }

  return `${base}#${hash}&${extra.join('&')}`;
}

export default function PdfEmbed({
  src,
  title,
}: PdfEmbedProps) {
  const iframeSrc = useMemo(() => withDefaultPdfView(src), [src]);

  return (
    <div className={`${styles.pdfWrap} pdfFullscreenTarget`}>
      <iframe allowFullScreen className={`vtPdfFrame ${styles.frame}`} src={iframeSrc} title={title} />
    </div>
  );
}
