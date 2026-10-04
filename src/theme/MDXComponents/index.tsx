import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import ScreenshotCallout from '@site/src/components/ScreenshotCallout';
import FigureBlock from '@site/src/components/FigureBlock';

// Zadržavamo podrazumevane komponente (admonicije, linkovi, slike...)
// i dodajemo naše. Bez ...MDXComponents ne rade :::upozorenja i
// apsolutni linkovi ne dobijaju jezički prefiks (/en/, /de/).
export default {
  ...MDXComponents,
  ScreenshotCallout,
  FigureBlock,
};
