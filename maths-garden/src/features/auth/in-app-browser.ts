/**
 * Google refuses OAuth inside embedded web views ("Error 403: disallowed_useragent"), and on an iPhone that is
 * where most people arrive: a link tapped in LinkedIn, Instagram, Facebook or Gmail opens in the app's own
 * browser, not Safari. Offering "Continue with Google" there sends them to a Google error page, so the button is
 * swapped for a way out to Safari. Email sign-in works fine in these browsers and stays.
 */
const NAMED: [RegExp, string][] = [
  [/LinkedInApp/i, 'LinkedIn'],
  [/Instagram/i, 'Instagram'],
  [/FBAN|FBAV|FB_IAB/i, 'Facebook'],
  [/musical_ly|TikTok|BytedanceWebview/i, 'TikTok'],
  [/Snapchat/i, 'Snapchat'],
  [/Twitter/i, 'X'],
  [/MicroMessenger/i, 'WeChat'],
  [/\bLine\//i, 'LINE'],
  [/Pinterest/i, 'Pinterest'],
];

/** The app whose built-in browser this is, 'an app' when it can't be named, or null in a real browser. */
export function inAppBrowser(userAgent: string = navigator.userAgent): string | null {
  for (const [pattern, name] of NAMED) if (pattern.test(userAgent)) return name;
  // Safari, and Chrome/Firefox/Edge on iOS, all carry a "Safari/" token; a bare WKWebView (Gmail, Outlook and
  // most other apps) does not.
  if (/iPhone|iPad|iPod/.test(userAgent) && !/Safari\//.test(userAgent)) return 'an app';
  return null;
}
