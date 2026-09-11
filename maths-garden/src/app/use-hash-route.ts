import { useEffect, useState } from 'react';

/** Hash routes (#/resources/…) so public pages work on GitHub Pages without server rewrites. */
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const [path, query = ''] = (hash.replace(/^#/, '') || '/').split('?');
  return { path, params: new URLSearchParams(query) };
}
