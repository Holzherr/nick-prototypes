import { useState, type FormEvent } from 'react';
import { useLocale, useT } from '@/features/i18n/i18n';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { KINDS, readReporter, REPORTERS, writeReporter, type Kind, type Reporter } from './reporter';
import { CONTACT_MAX, MESSAGE_MAX, sendFeedback } from './send-feedback';

/**
 * A quiet way to say what is wrong.
 *
 * Deliberately not a modal over a child's game: it sits in the footer of the pages a grown-up reads, opens
 * in place, and closes itself once the message is away. The contact field is optional and says so — asking
 * for an address before listening is how you lose the one sentence that would have told you the thing.
 *
 * Two rows of chips label the note: who is typing (three names, remembered on this device) and what sort
 * of thing it is (a bug, an idea, or something Tara did). Both are optional, and neither is free text — a
 * label the Analyst can group by is worth more than one that is spelled differently each time.
 *
 * A failure is shown, not swallowed. Somebody who has just typed a paragraph deserves to know it did not
 * arrive, so they can keep it rather than discover later that it went nowhere.
 */
export function FeedbackButton({ className, defaultOpen = false }: { className?: string; defaultOpen?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(defaultOpen);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [reporter, setReporter] = useState<Reporter | null>(readReporter);
  const [kind, setKind] = useState<Kind | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const pickReporter = (next: Reporter) => {
    const value = next === reporter ? null : next;
    setReporter(value);
    writeReporter(value);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setState('sending');
    const { ok } = await sendFeedback({ message, contact, locale, reporter, kind });
    setState(ok ? 'sent' : 'failed');
    if (ok) {
      setMessage('');
      setContact('');
      setKind(null);
      setTimeout(() => {
        setOpen(false);
        setState('idle');
      }, 2200);
    }
  };

  if (!open) {
    return (
      <Button variant="quiet" size="sm" className={className} onClick={() => setOpen(true)}>
        {t('footer.feedback')}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className={`w-full max-w-[520px] rounded-[28px] bg-cream p-5 text-left candy-petal [--candy:8px] ${className ?? ''}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-raspberry">What would make this better?</h3>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-xl text-grape/50 hover:text-grape">
          ✕
        </button>
      </div>

      <Chips label="Who is this from?" options={REPORTERS.map((name) => ({ id: name, label: name }))} value={reporter} onPick={pickReporter} />
      <Chips label="What sort of thing?" options={KINDS} value={kind} onPick={(next) => setKind(next === kind ? null : next)} />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={MESSAGE_MAX}
        rows={4}
        required
        autoFocus
        aria-label="Your feedback"
        placeholder="Anything at all — what confused you, what your child liked, what is missing."
        className="mt-3 w-full resize-y rounded-2xl border-2 border-petal bg-white p-3 text-grape outline-none transition-colors placeholder:text-grape/40 focus:border-bubble"
      />

      <Input
        type="email"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        maxLength={CONTACT_MAX}
        autoComplete="email"
        aria-label="Your email, if you would like a reply"
        placeholder="Email (optional — only if you want a reply)"
        className="mt-2"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={state === 'sending' || !message.trim()}>
          {state === 'sending' ? 'Sending…' : 'Send'}
        </Button>
        {state === 'sent' && <span className="font-semibold text-leaf-deep">Thank you — that went straight to Nick.</span>}
        {state === 'failed' && <span className="font-semibold text-raspberry">That didn’t send. Copy your message somewhere safe and try again.</span>}
      </div>
    </form>
  );
}

/** One row of chips, at most one lit. Tapping the lit one turns it off again. */
function Chips<Id extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: readonly { id: Id; label: string }[];
  value: Id | null;
  onPick: (id: Id) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="mt-3">
      <span className="mb-1.5 block text-sm font-semibold text-grape/70">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const chosen = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => onPick(option.id)}
              className={cn(
                'min-h-11 rounded-2xl border-2 px-4 font-semibold text-grape transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-bubble/40',
                chosen ? 'border-bubble bg-petal/60' : 'border-petal bg-white hover:border-bubble/60',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
