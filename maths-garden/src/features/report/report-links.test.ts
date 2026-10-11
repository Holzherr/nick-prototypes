import { describe, expect, it } from 'vitest';
import { foreignLinks } from '../../../supabase/functions/send-report/links';

const ORIGINS = ['https://nickholzherr.com', 'http://localhost:5173'];

describe('send-report link check', () => {
  it('refuses a link, image or bare address anywhere else', () => {
    expect(foreignLinks('<a href="https://evil.example/login">Sign in</a>', undefined, ORIGINS)).toEqual(['https://evil.example/login']);
    expect(foreignLinks("<img src='http://evil.example/p.gif'>", undefined, ORIGINS)).toHaveLength(1);
    expect(foreignLinks('<a href=javascript:alert(1)>x</a>', undefined, ORIGINS)).toHaveLength(1);
    expect(foreignLinks('<a href="&#106;avascript:alert(1)">x</a>', undefined, ORIGINS)).toHaveLength(1);
    expect(foreignLinks('<div style="background:url(https://evil.example/x)">x</div>', undefined, ORIGINS)).toHaveLength(1);
    expect(foreignLinks('<p>Visit www.evil.example now</p>', undefined, ORIGINS)).toHaveLength(1);
    expect(foreignLinks('<p>ok</p>', 'Go to https://evil.example', ORIGINS)).toHaveLength(1);
    expect(foreignLinks('<a href="https://nickholzherr.com.evil.example/">x</a>', undefined, ORIGINS)).toHaveLength(1);
  });
});
