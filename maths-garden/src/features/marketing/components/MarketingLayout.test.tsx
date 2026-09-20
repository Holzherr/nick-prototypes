import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MarketingLayout } from './MarketingLayout';

vi.mock('@/features/analytics/events', () => ({ track: vi.fn(), cleanPath: () => '/' }));

/**
 * jsdom has no matchMedia and no layout, so the width is told, not measured: the header asks
 * `(min-width: 640px)` and this answers it. Tailwind's `sm` is the same 640px.
 */
function atWidth(px: number) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: /min-width:\s*640px/.test(query) ? px >= 640 : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const header = () => screen.getByRole('banner');
const navLinks = () => [/free printables/i, /how it works/i, /guides/i, /faq/i];
const language = (root: HTMLElement) => within(root).queryByRole('combobox', { name: /choose a language/i });

describe('the marketing header', () => {
  afterEach(() => {
    // @ts-expect-error jsdom never defines it; put it back that way for the other suites.
    delete window.matchMedia;
  });

  /**
   * On a phone the header wrapped to two rows — Free printables / How it works / Guides, then FAQ /
   * language / Sign in — so a child creating a profile met six adult links first. Below `sm` it is the
   * logo, one Menu button and Sign in; every link is still there, one tap down.
   */
  it('at 390px folds the links and the language picker into one Menu, with Sign in beside it', () => {
    atWidth(390);
    render(<MarketingLayout><p>page</p></MarketingLayout>);

    for (const name of navLinks()) expect(within(header()).queryByRole('link', { name })).toBeNull();
    expect(within(header()).queryByRole('button', { name: /how it works/i })).toBeNull();
    expect(language(header())).toBeNull();
    expect(within(header()).getByRole('link', { name: /sign in/i })).toBeVisible();

    const menu = within(header()).getByRole('button', { name: /^menu$/i });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');

    expect(within(header()).getByRole('link', { name: /free printables/i })).toHaveAttribute('href', '#/resources');
    expect(within(header()).getByRole('button', { name: /how it works/i })).toBeInTheDocument();
    expect(within(header()).getByRole('link', { name: /guides/i })).toHaveAttribute('href', expect.stringContaining('#/guides/'));
    expect(within(header()).getByRole('button', { name: /faq/i })).toBeInTheDocument();
    expect(language(header())).toBeInTheDocument();
    // Sign in stays where it was, outside the panel.
    expect(within(header()).getByRole('link', { name: /sign in/i })).toBeVisible();

    // jsdom has no layout, so the anchoring is read off the classes: the panel spans the header
    // (`relative`, 20px in from each side) instead of hanging 320px wide off the Menu button, which
    // has Sign in to its right and put the panel's first ~45px past the left edge of a 390px screen.
    const panel = within(header()).getByRole('link', { name: /free printables/i }).closest('.absolute');
    expect(panel).toHaveClass('inset-x-5');
    expect(panel).not.toHaveClass('w-[320px]');
    expect(header()).toHaveClass('relative');
    expect(menu.parentElement).not.toHaveClass('relative');
  });

  it('at 390px picking from the menu closes it', () => {
    atWidth(390);
    render(<MarketingLayout><p>page</p></MarketingLayout>);

    fireEvent.click(within(header()).getByRole('button', { name: /^menu$/i }));
    fireEvent.click(within(header()).getByRole('link', { name: /guides/i }));
    expect(within(header()).getByRole('button', { name: /^menu$/i })).toHaveAttribute('aria-expanded', 'false');
    expect(within(header()).queryByRole('link', { name: /guides/i })).toBeNull();
  });

  it('at 1024px renders the links, the language picker and Sign in inline, with no Menu button', () => {
    atWidth(1024);
    render(<MarketingLayout><p>page</p></MarketingLayout>);

    expect(within(header()).queryByRole('button', { name: /^menu$/i })).toBeNull();
    expect(within(header()).getByRole('button', { name: /free printables/i })).toHaveAttribute('aria-expanded', 'false');
    expect(within(header()).getByRole('button', { name: /how it works/i })).toBeInTheDocument();
    expect(within(header()).getByRole('link', { name: /guides/i })).toHaveAttribute('href', expect.stringContaining('#/guides/'));
    expect(within(header()).getByRole('button', { name: /faq/i })).toBeInTheDocument();
    expect(language(header())).toBeInTheDocument();
    expect(within(header()).getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  it('without matchMedia (jsdom, docs) assumes the wide header', () => {
    render(<MarketingLayout><p>page</p></MarketingLayout>);
    expect(within(header()).queryByRole('button', { name: /^menu$/i })).toBeNull();
    expect(within(header()).getByRole('button', { name: /how it works/i })).toBeInTheDocument();
  });
});
