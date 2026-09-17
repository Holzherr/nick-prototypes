import { useState, type FormEvent } from 'react';
import { useLocale, useT } from '@/features/i18n/i18n';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { CONTACT_MAX, MESSAGE_MAX, sendFeedback } from './send-feedback';

/**
 * A quiet way to say what is wrong.
 *
 * Deliberately not a modal over a child's game: it sits in the footer of the pages a grown-up reads, opens
 * in place, and closes itself once the message is away. The contact field is optional and says so — asking
 * for an address before listening is how you lose the one sentence that would have told you the thing.
 *
 * A failure is shown, not swallowed. Somebody who has just typed a paragraph deserves to know it did not
 * arrive, so they can keep it rather than discover later that it went nowhere.
 */
export function FeedbackButton({ className }: { className?: string }) {
  const t = useT();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setState('sending');
    const { ok } = await sendFeedback({ message, contact, locale });
    setState(ok ? 'sent' : 'failed');
    if (ok) {
      setMessage('');
      setContact('');
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
