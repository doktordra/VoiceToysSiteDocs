import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import type {SidebarsConfig, SidebarItem} from '@docusaurus/plugin-content-docs';

type UputstvoDoc = {
  file: string;
  id: string;
  title: string;
  sidebarPosition: number;
  slug?: string;
  headings: Array<{label: string; slug: string}>;
};

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function parseDoc(filePath: string): UputstvoDoc {
  const content = fs.readFileSync(filePath, 'utf8');
  const file = path.basename(filePath);
  const id = file.replace(/^\d+-/, '').replace(/\.md$/, '');
  const titleMatch = content.match(/\ntitle:\s*(.+)\n/);
  const positionMatch = content.match(/\nsidebar_position:\s*(\d+)\n/);
  const slugMatch = content.match(/\nslug:\s*(.+)\n/);

  const slugger = new GithubSlugger();
  const headings: Array<{label: string; slug: string}> = [];

  for (const line of content.split(/\r?\n/)) {
    const headingMatch = line.match(/^(##|###)\s+(.+)$/);
    if (!headingMatch) continue;

    const rawHeading = headingMatch[2].replace(/\s*#+\s*$/, '').trim();
    const label = stripInlineMarkdown(rawHeading);
    if (!label) continue;

    headings.push({
      label,
      slug: slugger.slug(label),
    });
  }

  return {
    file,
    id,
    title: titleMatch ? titleMatch[1].trim() : id,
    sidebarPosition: positionMatch ? Number(positionMatch[1]) : Number.MAX_SAFE_INTEGER,
    slug: slugMatch ? slugMatch[1].trim() : undefined,
    headings,
  };
}

function buildDocRoute(doc: UputstvoDoc): string {
  if (doc.slug === '/') return '/uputstvo/';
  if (!doc.slug) return `/uputstvo/${doc.id}`;
  return `/uputstvo/${doc.slug.replace(/^\//, '')}`;
}

function createSidebarItems(docsDir: string): SidebarItem[] {
  const docs = fs
    .readdirSync(docsDir)
    .filter((name) => /^\d+.*\.md$/.test(name))
    .map((name) => parseDoc(path.join(docsDir, name)))
    .sort((a, b) => a.sidebarPosition - b.sidebarPosition || a.file.localeCompare(b.file));

  return docs.map((doc) => {
    if (doc.headings.length === 0) {
      return doc.id;
    }

    const route = buildDocRoute(doc);
    const tocItems = doc.headings.map((heading, index) => ({
      type: 'link' as const,
      key: `${doc.id}-toc-${index + 1}`,
      label: heading.label,
      href: encodeURI(`${route}#${heading.slug}`),
    }));

    return {
      type: 'category' as const,
      label: doc.title,
      link: {type: 'doc' as const, id: doc.id},
      collapsed: true,
      collapsible: true,
      items: tocItems,
    };
  });
}

const sidebars: SidebarsConfig = {
  uputstvoSidebar: createSidebarItems(path.join(__dirname, 'uputstvo')),
};

export default sidebars;
