import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type Props = {
  /** Path to the screenshot image (same syntax as markdown: ./images/foo.png) */
  src: string;
  /** Alt text for the image */
  alt?: string;
  /** Optional caption shown below the image */
  caption?: string;
  /** Image side on desktop layouts */
  imagePosition?: 'left' | 'right';
  /** Explanatory text — written as markdown children inside the tag */
  children: React.ReactNode;
};

/**
 * FigureBlock — places a screenshot on the left and descriptive text on the right.
 * On narrow / portrait screens they stack vertically (image on top, text below).
 *
 * Usage in MDX:
 *
 *   <FigureBlock
 *     src="/voice-toys/images/screenshots/sr/primer.jpg"
 *     alt="Opis slike"
 *     caption="Kratko objašnjenje slike"
 *   >
 *   Ovo je tekst koji objašnjava screenshot. Može sadržati **bold**, liste itd.
 *   Svaki tekst ovde se prevodi normalno jer je to obični markdown sadržaj.
 *   </FigureBlock>
 */
export default function FigureBlock({
  src,
  alt = '',
  caption,
  imagePosition = 'left',
  children,
}: Props): React.JSX.Element {
  const resolvedSrc = useBaseUrl(src);
  const normalizedCaption = typeof caption === 'string' ? caption.trim() : caption;

  // Allow translators/editors to keep caption as normal markdown text:
  // first child paragraph containing only italic text is treated as image caption.
  const childNodes = React.Children.toArray(children);
  let markdownCaption: React.ReactNode | undefined;
  let contentNodes: React.ReactNode[] = childNodes;

  const firstMeaningfulIndex = childNodes.findIndex((node) => {
    if (typeof node === 'string') {
      return node.trim().length > 0;
    }
    return true;
  });

  const firstNode = firstMeaningfulIndex >= 0 ? childNodes[firstMeaningfulIndex] : undefined;
  if (React.isValidElement(firstNode) && firstNode.type === 'p') {
    const pChildren = React.Children.toArray(firstNode.props.children).filter((node) => {
      if (typeof node === 'string') {
        return node.trim().length > 0;
      }
      return true;
    });

    if (pChildren.length === 1) {
      const maybeEm = pChildren[0];
      if (React.isValidElement(maybeEm) && maybeEm.type === 'em') {
        markdownCaption = maybeEm.props.children;
        contentNodes = childNodes.filter((_, index) => index !== firstMeaningfulIndex);
      }
    }
  }

  const resolvedCaption = normalizedCaption || markdownCaption;
  const wrapClassName = imagePosition === 'right' ? `${styles.wrap} ${styles.wrapRight}` : styles.wrap;

  return (
    <div className={wrapClassName}>
      <div className={styles.img}>
        <img src={resolvedSrc} alt={alt} />
        {resolvedCaption ? <p className={styles.caption}><em>{resolvedCaption}</em></p> : null}
      </div>
      <div className={styles.text}>{contentNodes}</div>
    </div>
  );
}
