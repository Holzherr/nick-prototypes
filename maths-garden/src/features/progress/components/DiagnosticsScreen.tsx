import { useEffect, useState } from 'react';
import { SUPABASE_URL } from '@/app/config';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { readJSON } from '@/shared/utils/storage';

interface Line {
  label: string;
  value: string;
}

const GUEST_FLAG = 'maths-garden:guest';
const GUEST_CHILDREN = 'maths-garden:guest-children';
const PROGRESS_PREFIX = 'maths-garden:progress:';

/** Never print a token or a key: this screen exists to be screenshotted and pasted to someone else. */
const projectRef = () => SUPABASE_URL.replace('https://', '').split('.')[0];

function collect(): Line[] {
  const lines: Line[] = [];
  const add = (label: string, value: unknown) => lines.push({ label, value: String(value) });

  add('Build', typeof __BUILD__ === 'string' ? __BUILD__ : 'unknown');
  const bundle = [...document.querySelectorAll('script[src]')].map((s) => (s as HTMLScriptElement).src).find((s) => s.includes('/assets/'));
  add('Bundle', bundle ? bundle.split('/').pop() : 'none');
  add('Page', `${window.location.pathname}${window.location.hash}`);
  add('Project', projectRef());
  add('Online', navigator.onLine ? 'yes' : 'no');

  try {
    const keys = Object.keys(localStorage);
    const session = keys.find((k) => k.endsWith('auth-token'));
    add('Signed in', session ? 'yes' : 'no');
    if (session) {
      // Only the address, never the token itself.
      try {
        const raw = JSON.parse(localStorage.getItem(session) ?? '{}') as { user?: { email?: string } };
        add('Account', raw.user?.email ?? 'unknown');
      } catch {
        add('Account', 'unreadable');
      }
    }
    add('Guest flag', readJSON(GUEST_FLAG, false) ? 'set' : 'not set');

    const guests = readJSON<{ id: string; name: string }[]>(GUEST_CHILDREN, []);
    add('Guest children', guests.length ? guests.map((g) => g.name).join(', ') : 'none');

    const caches = keys.filter((k) => k.startsWith(PROGRESS_PREFIX));
    for (const key of caches) {
      const p = readJSON<{ rounds?: unknown[]; stickers?: unknown[] }>(key, {});
      add(`Saved play …${key.slice(-6)}`, `${p.rounds?.length ?? 0} rounds, ${p.stickers?.length ?? 0} stickers`);
    }
    const outbox = readJSON<unknown[]>('maths-garden:outbox', []);
    const guestOutbox = readJSON<unknown[]>('maths-garden:guest-outbox', []);
    add('Waiting to upload', `${outbox.length} (guest: ${guestOutbox.length})`);
  } catch {
    add('Storage', 'blocked — private browsing?');
  }

  return lines;
}

/**
 * Everything needed to answer "why does this device not match what I just shipped", on one screen.
 *
 * An iPad served a build from the first day for hours while fixes were published over it, and nothing on
 * screen said so: every instruction given was impossible to follow, and it took six exchanges and a
 * screenshot to find. The build stamp in the grown-ups footer answers that one question; this answers the
 * rest — which bundle, which worker, signed in as whom, what is still queued, what guest play is on the
 * device. Public on purpose (`#/diagnostics`, above AuthProvider): the moment it is needed most is when
 * signing in is the thing that is broken.
 */
export function DiagnosticsScreen() {
  const supported = 'serviceWorker' in navigator;
  const [lines, setLines] = useState<Line[]>(() => collect());
  // Known at render when there is no worker API at all; only the registration list needs asking for.
  const [worker, setWorker] = useState(supported ? 'checking…' : 'not supported');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!supported) return;
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      const controller = navigator.serviceWorker.controller?.scriptURL;
      setWorker(regs.length === 0 ? 'none registered' : `${regs.length} — ${controller ? controller.split('/maths/')[1] : 'not controlling this page'}`);
    });
  }, [supported]);

  const all = [...lines, { label: 'Service worker', value: worker }];
  const asText = all.map((l) => `${l.label}: ${l.value}`).join('\n');

  return (
    <div className="relative z-10 flex min-h-dvh justify-center px-4 py-10">
      <Card className="w-full max-w-[560px] p-6">
        <h1 className="text-2xl font-semibold text-raspberry">Maths Garden — this device</h1>
        <p className="mt-1 text-sm text-grape/70">Nothing here is private: no keys, no tokens. Safe to screenshot or paste.</p>

        <dl className="mt-5 flex flex-col divide-y-2 divide-dashed divide-petal">
          {all.map((line) => (
            <div key={line.label} className="flex flex-wrap justify-between gap-x-4 py-2.5">
              <dt className="font-semibold text-grape">{line.label}</dt>
              <dd className="break-all text-right text-grape/80">{line.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              void navigator.clipboard?.writeText(asText).then(
                () => setCopied(true),
                () => setCopied(false),
              );
            }}
          >
            {copied ? 'Copied ✓' : 'Copy all'}
          </Button>
          <Button variant="quiet" onClick={() => setLines(collect())}>
            Refresh
          </Button>
          <a href="#/app" className="flex items-center px-2 font-semibold text-raspberry underline">
            Back to the app
          </a>
        </div>

        <p className="mt-6 text-sm text-grape/60">
          Stuck on an old version? Open <b className="break-all">/maths-reset.html</b> — it clears the cached app and leaves saved play alone.
        </p>
      </Card>
    </div>
  );
}
