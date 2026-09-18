import { describe, expect, it } from 'vitest';
import { inAppBrowser } from './in-app-browser';

const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)';

describe('spotting an app’s built-in browser', () => {
  it('names the common ones', () => {
    expect(inAppBrowser(`${IOS} Mobile/15E148 [LinkedInApp]/9.30`)).toBe('LinkedIn');
    expect(inAppBrowser(`${IOS} Mobile/15E148 Instagram 350.0`)).toBe('Instagram');
    expect(inAppBrowser(`${IOS} Mobile/15E148 [FBAN/FBIOS;FBAV/480.0]`)).toBe('Facebook');
  });

  it('catches an unnamed iOS web view, such as Gmail’s', () => {
    expect(inAppBrowser(`${IOS} Mobile/15E148`)).toBe('an app');
  });

  it('leaves real browsers alone', () => {
    expect(inAppBrowser(`${IOS} Version/18.0 Mobile/15E148 Safari/604.1`)).toBeNull();
    expect(inAppBrowser(`${IOS} CriOS/129.0 Mobile/15E148 Safari/604.1`)).toBeNull();
    expect(inAppBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15')).toBeNull();
  });
});
