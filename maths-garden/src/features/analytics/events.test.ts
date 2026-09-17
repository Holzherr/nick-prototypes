import { describe, expect, it } from 'vitest';
import { cleanPath } from './events';

/**
 * A printable's link carries the child's name and avatar — `#/resources/sheet?id=…&name=Tara&icon=🦄`.
 * Recording a raw path would put a four-year-old's name in an analytics table, which is the single thing
 * this must never do, so the sanitiser is an allowlist rather than a blocklist and is tested as one.
 */
describe('cleanPath', () => {
  it('keeps the route and which sheet, and drops everything describing a child', () => {
    expect(cleanPath('#/resources/sheet?id=bond-frames&stage=2&name=Tara&icon=%F0%9F%A6%84')).toBe('/resources/sheet?id=bond-frames&stage=2');
    expect(cleanPath('#/resources/pack?name=Tara&icon=%F0%9F%A6%84')).toBe('/resources/pack');
  });

  it('handles the bare routes', () => {
    expect(cleanPath('')).toBe('/');
    expect(cleanPath('#/')).toBe('/');
    expect(cleanPath('#/home')).toBe('/home');
  });

  it('records no name or avatar however the parameter is spelled', () => {
    for (const hash of ['#/x?name=Tara', '#/x?NAME=Tara', '#/x?child=Tara', '#/x?icon=%F0%9F%A6%84', '#/x?id=ok&name=Tara']) {
      expect(cleanPath(hash)).not.toMatch(/Tara/i);
    }
  });

  it('caps what a crafted link can write', () => {
    expect(cleanPath(`#/${'a'.repeat(400)}`).length).toBeLessThanOrEqual(120);
    expect(cleanPath(`#/x?id=${'b'.repeat(400)}`).length).toBeLessThanOrEqual(120);
  });
});
