// Every link in a report must point back at the app.
//
// The app writes the report, so the function mails whatever HTML a signed-in caller sends. With sign-up
// confirmation off, "signed in" is anyone holding any address, so without this check the function is a
// way to mail a stranger a page of links from our sender. A real report only ever links to the app.

const ATTR = /\b(?:href|src|srcset|action|formaction|background|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const CSS_URL = /url\(\s*(['"]?)([^'")]*)\1\s*\)/gi;
const BARE_URL = /\b(?:https?:\/\/|www\.)[^\s<>"')]+/gi;

const allowedUrl = (raw: string, origins: string[]) => {
  try {
    const url = new URL(raw.trim());
    return (url.protocol === 'https:' || url.protocol === 'http:') && origins.includes(url.origin);
  } catch {
    return false;
  }
};

/** The links in `html` and `text` that do not lead to one of `origins`. Empty means the report may go. */
export function foreignLinks(html: string, text: string | undefined, origins: string[]): string[] {
  const found: string[] = [];
  for (const m of html.matchAll(ATTR)) found.push(...(m[1] ?? m[2] ?? m[3] ?? '').split(/\s*,\s*/).map((s) => s.split(/\s+/)[0]));
  for (const m of html.matchAll(CSS_URL)) found.push(m[2]);
  for (const body of [html.replace(/<[^>]*>/g, ' '), text ?? '']) for (const m of body.matchAll(BARE_URL)) found.push(m[0]);
  return found.filter((u) => u && !allowedUrl(u.startsWith('www.') ? `https://${u}` : u, origins));
}
