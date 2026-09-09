/** Poster lookup via the Wikipedia page-summary API: try "<title> (film)", then with year, then bare. */
export async function fetchPosterUrl(title: string, type: string, year: number): Promise<string | null> {
  const suffix = type === 'series' ? ' (TV series)' : ' (film)';
  const queries = [`${title}${suffix}`, `${title} (${year}${suffix.replace('(', ' ').replace(')', '')})`, title];
  for (const q of queries) {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, {
        headers: { 'User-Agent': 'Qeued/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail?.source) return data.originalimage?.source || data.thumbnail.source;
      } else {
        await res.text();
      }
    } catch {
      /* try the next query */
    }
  }
  return null;
}
