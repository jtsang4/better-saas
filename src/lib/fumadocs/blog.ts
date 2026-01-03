import { blog } from '@/.source';
import { loader } from 'fumadocs-core/source';
import type { InferMetaType, InferPageType, VirtualFile } from 'fumadocs-core/source';
import type { ComponentType } from 'react';
import { normalizeSourceFiles } from './source-utils';

const blogSourceFiles = normalizeSourceFiles(
  blog.toFumadocsSource() as unknown as { files: VirtualFile[] | (() => VirtualFile[]) }
);

export const blogSource = loader({
  baseUrl: '/blog',
  source: { files: blogSourceFiles },
});

export type BlogMeta = InferMetaType<typeof blogSource>;
type BlogPageData = Record<string, unknown> & {
  body: ComponentType<{ components?: Record<string, unknown> }>;
  title?: string;
  description?: string;
};

export type BlogPage = Omit<InferPageType<typeof blogSource>, 'data'> & { data: BlogPageData };

interface BlogFrontmatter {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

export function getBlogPosts(locale = 'en'): BlogPage[] {
  const allPosts = blogSource.getPages() as BlogPage[];

  const filteredPosts = allPosts.filter((post) => {
    const urlParts = post.url.split('/');
    const postLocale = urlParts[2];
    return postLocale === locale;
  });

  return filteredPosts.sort((a, b) => {
    const frontmatterA = a.data as BlogFrontmatter;
    const frontmatterB = b.data as BlogFrontmatter;
    const dateA = new Date(frontmatterA.date || '');
    const dateB = new Date(frontmatterB.date || '');
    return dateB.getTime() - dateA.getTime();
  });
}

export function getBlogPost(slug: string[], locale = 'en'): BlogPage | undefined {
  const fullSlug = [locale, ...slug];
  return blogSource.getPage(fullSlug) as BlogPage | undefined;
}

export function formatDate(date: string | Date, locale = 'en'): string {
  const d = new Date(date);
  const localeMap = {
    zh: 'zh-CN',
    en: 'en-US',
  };

  return d.toLocaleDateString(localeMap[locale as keyof typeof localeMap] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
