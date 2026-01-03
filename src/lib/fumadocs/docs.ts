import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import type { InferMetaType, InferPageType, VirtualFile } from 'fumadocs-core/source';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { ComponentType } from 'react';
import { normalizeSourceFiles } from './source-utils';

const getFileStem = (filePath: string) => {
  const filename = filePath.split('/').pop() ?? '';
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex === -1 ? filename : filename.slice(0, dotIndex);
};

const isIndexPage = (page: { path: string; slugs: string[] }) =>
  page.slugs.length === 1 && getFileStem(page.path) === 'index';

const docsSourceFiles = normalizeSourceFiles(
  docs.toFumadocsSource() as unknown as { files: VirtualFile[] | (() => VirtualFile[]) }
);

export const docsSource = loader({
  baseUrl: '/docs',
  source: { files: docsSourceFiles },
});

export type DocsMeta = InferMetaType<typeof docsSource>;
type DocsPageData = Record<string, unknown> & {
  body: ComponentType<{ components?: Record<string, unknown> }>;
  toc?: TOCItemType[];
  full?: boolean;
  title?: string;
  description?: string;
};

export type DocsPage = Omit<InferPageType<typeof docsSource>, 'data'> & { data: DocsPageData };

interface DocsFrontmatter {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

interface MetaConfig {
  title?: string;
  pages?: string[];
  defaultOpen?: boolean;
}

// New types for nested folder structure
export interface DocsTreeItem {
  type: 'page' | 'folder';
  name: string;
  url?: string;
  children?: DocsTreeItem[];
  defaultOpen?: boolean;
}

// Cloudflare Workers compatible meta config getter
function getMetaConfigFromSource(locale: string, folderPath = ''): MetaConfig | null {
  try {
    // Access the compiled meta data from .source/index.ts
    // Build the expected meta path
    const metaPath = folderPath ? `${locale}/${folderPath}/meta.json` : `${locale}/meta.json`;
    
    // Find the meta file in the source data
    const metaFile = docsSourceFiles.find((file) => file.path === metaPath && file.type === 'meta');
    
    if (metaFile?.data) {
      return metaFile.data as MetaConfig;
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to get meta config for ${locale}/${folderPath}:`, error);
    return null;
  }
}

export function getDocsPages(locale = 'en'): DocsPage[] {
  const allPages = docsSource.getPages() as DocsPage[];
  
  const filteredPages = allPages.filter((page) => {
    const urlParts = page.url.split('/');
    const pageLocale = urlParts[2];
    return pageLocale === locale && getFileStem(page.path) !== 'meta';
  });

  // Get meta configuration for ordering
  const metaConfig = getMetaConfigFromSource(locale);
  
  if (metaConfig?.pages) {
    // Create a map for quick lookup
    const pageMap = new Map<string, DocsPage>();
    for (const page of filteredPages) {
      // For index pages, the slug array is ['en'] or ['zh'], we need to map this to 'index'
      if (isIndexPage(page)) {
        pageMap.set('index', page);
      } else {
        const pageSlug = page.slugs[page.slugs.length - 1];
        if (pageSlug) {
          pageMap.set(pageSlug, page);
        }
      }
    }
    
    // Order pages according to meta.json
    const orderedPages: DocsPage[] = [];
    for (const pageSlug of metaConfig.pages) {
      const page = pageMap.get(pageSlug);
      if (page) {
        orderedPages.push(page);
        pageMap.delete(pageSlug);
      }
    }
    
    // Add any remaining pages that weren't in meta.json
    for (const remainingPage of pageMap.values()) {
      orderedPages.push(remainingPage);
    }
    
    return orderedPages;
  }

  // Default sorting if no meta.json
  return filteredPages.sort((a, b) => {
    // Put index page first
    if (a.slugs.includes('index')) return -1;
    if (b.slugs.includes('index')) return 1;
    
    // Then sort by title
    const titleA = a.data.title || '';
    const titleB = b.data.title || '';
    return titleA.localeCompare(titleB);
  });
}

export function getDocsPage(slug: string[], locale = 'en'): DocsPage | undefined {
  const fullSlug = [locale, ...slug];
  return docsSource.getPage(fullSlug) as DocsPage | undefined;
}

export function getDocsPageTree(locale = 'en') {
  const pages = getDocsPages(locale);
  return pages;
}

// Cloudflare Workers compatible docs tree builder
export function buildDocsTree(locale = 'en'): DocsTreeItem[] {
  const allPages = docsSource.getPages();
  
  const filteredPages = allPages.filter((page) => {
    const urlParts = page.url.split('/');
    const pageLocale = urlParts[2];
    return pageLocale === locale && getFileStem(page.path) !== 'meta';
  });

  // Get root meta configuration
  const rootMetaConfig = getMetaConfigFromSource(locale);
  const tree: DocsTreeItem[] = [];

  if (rootMetaConfig?.pages) {
    // Process each item in the root meta.json
    for (const pageSlug of rootMetaConfig.pages) {
      // Check if this is a folder by looking for pages with more than 2 slugs
      // and where the second slug matches pageSlug
      const folderPages = filteredPages.filter(page => 
        page.slugs.length > 2 && page.slugs[1] === pageSlug
      );
      
      if (folderPages.length > 0) {
        // This is a folder
        const folderMetaConfig = getMetaConfigFromSource(locale, pageSlug);
        const folderItem: DocsTreeItem = {
          type: 'folder',
          name: folderMetaConfig?.title || pageSlug,
          defaultOpen: folderMetaConfig?.defaultOpen || false,
          children: []
        };

        // Process folder contents
        if (folderMetaConfig?.pages) {
          for (const subPageSlug of folderMetaConfig.pages) {
            const subPage = folderPages.find(page => 
              page.slugs[page.slugs.length - 1] === subPageSlug
            );
            if (subPage) {
              folderItem.children?.push({
                type: 'page',
                name: subPage.data.title || subPageSlug,
                url: `/docs/${pageSlug}/${subPageSlug}`
              });
            }
          }
        }

        tree.push(folderItem);
      } else {
        // This is a regular page
        const page = filteredPages.find(p => {
          if (pageSlug === 'index') {
            return isIndexPage(p);
          }
          return p.slugs.length === 2 && p.slugs[1] === pageSlug;
        });

        if (page) {
          const url = pageSlug === 'index' ? '/docs' : `/docs/${pageSlug}`;
          tree.push({
            type: 'page',
            name: page.data.title || pageSlug,
            url
          });
        }
      }
    }
  }

  return tree;
}
