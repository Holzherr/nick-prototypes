import { describe, expect, it } from 'vitest';
import { SKILLS } from '@/features/curriculum/skills';
import { ARTICLES, articleBySlug } from './articles';
import { FAQ } from './faq';
import { RESOURCE_MENU } from './menu';

describe('marketing pages', () => {
  it('has a guide per slug, each with sources', () => {
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length);
    for (const article of ARTICLES) {
      expect(articleBySlug(article.slug)).toBe(article);
      expect(article.references.length).toBeGreaterThanOrEqual(5);
      expect(article.blocks.length).toBeGreaterThan(8);
      // Anything with a link must be a real one, not a placeholder.
      expect(article.references.every((r) => r.href === undefined || r.href.startsWith('https://'))).toBe(true);
    }
    expect(articleBySlug('nope')).toBeUndefined();
  });

  it('points every FAQ link at a page that exists', () => {
    for (const item of FAQ) {
      if (!item.link) continue;
      expect(item.link.href.startsWith('#/')).toBe(true);
      if (item.link.href.startsWith('#/guides/')) expect(articleBySlug(item.link.href.replace('#/guides/', ''))).toBeDefined();
    }
    expect(FAQ.length).toBeGreaterThanOrEqual(8);
  });

  it('offers a printable for every skill in the menu', () => {
    expect(RESOURCE_MENU).toHaveLength(SKILLS.length);
    for (const group of RESOURCE_MENU) {
      expect(group.printables.length).toBeGreaterThan(0);
      expect(group.printables.every((p) => p.link?.(1).startsWith('#/resources/'))).toBe(true);
    }
  });
});
