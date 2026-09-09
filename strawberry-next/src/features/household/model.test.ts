import { describe, expect, it } from 'vitest';
import { inviteCodeFromPath, inviteLink } from './model';

describe('invite links', () => {
  it('includes the app base, so a link made on the Pages preview still resolves', () => {
    expect(inviteLink('abc123', 'https://holzherr.github.io', '/nick-prototypes/strawberry-next/')).toBe(
      'https://holzherr.github.io/nick-prototypes/strawberry-next/join/abc123',
    );
  });

  it('does not double the slash when the app is served from the root', () => {
    expect(inviteLink('abc123', 'https://strawberry.example', '/')).toBe(
      'https://strawberry.example/join/abc123',
    );
  });

  it('reads a code back out of a path', () => {
    expect(inviteCodeFromPath('/nick-prototypes/strawberry-next/join/abc123')).toBe('abc123');
    expect(inviteCodeFromPath('/join/abc123')).toBe('abc123');
    expect(inviteCodeFromPath('/box')).toBeNull();
  });
});
