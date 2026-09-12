import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import type { SkillReport, TutorReport } from './report';

const VERDICT: Record<SkillReport['verdict'], { label: string; className: string }> = {
  strength: { label: 'Strong', className: 'bg-leaf text-white' },
  steady: { label: 'Coming along', className: 'bg-sunny' },
  focus: { label: 'Needs work', className: 'bg-bubble text-white' },
  new: { label: 'Not started', className: 'bg-blush text-grape/70' },
};

export interface ReportScreenProps {
  report: TutorReport;
  /** Emailing the report; missing when there is no signed-in address to send to. */
  email?: { address: string; busy: boolean; sent: boolean; error: string | null; onSend: () => void };
  onClose: () => void;
}

/**
 * The tutor report on one card, and the same thing that goes out by email: a headline, the week, a row per
 * skill with a verdict and a plain-English note, the sheets to print next, off-screen practice and any
 * warning signs. Printable as is.
 */
export function ReportScreen({ report, email, onClose }: ReportScreenProps) {
  const { week } = report;
  return (
    <div className="relative z-10 flex min-h-dvh justify-center px-4 pb-10 pt-[max(24px,env(safe-area-inset-top))] print:p-0">
      <Card className="w-full max-w-[760px] p-[clamp(20px,4vw,34px)] print:rounded-none print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-bubble">Tutor report · stage {report.stage}</p>
            <h2 className="text-3xl font-semibold text-raspberry">{report.childName}</h2>
            <p className="mt-1 text-sm text-grape/70">{new Date(report.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <Button variant="quiet" size="sm" className="print:hidden" onClick={onClose}>
            Close
          </Button>
        </header>

        <p className="mt-4 text-lg">{report.headline}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-blush px-3 py-1">
            📅 {week.rounds} round{week.rounds === 1 ? '' : 's'} on {week.days} day{week.days === 1 ? '' : 's'} this week
          </span>
          <span className="rounded-full bg-blush px-3 py-1">⏱ ~{week.minutes} min</span>
          {week.quit > 0 && <span className="rounded-full bg-blush px-3 py-1">🏠 {week.quit} left early</span>}
        </div>

        <h3 className="mt-7 text-2xl font-semibold text-raspberry">Skill by skill</h3>
        <div className="mt-2">
          {report.skills.map((skill) => (
            <div key={skill.skill.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b-2 border-dashed border-petal py-3">
              <span className="min-w-[190px] flex-1 text-lg font-semibold">
                {skill.skill.emoji} {skill.skill.name}
              </span>
              <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', VERDICT[skill.verdict].className)}>{VERDICT[skill.verdict].label}</span>
              <span className="w-14 text-right font-bold">{skill.pct === null ? '—' : `${skill.pct}%`}</span>
              <p className="w-full text-sm text-grape/80">{skill.note}</p>
            </div>
          ))}
        </div>

        {report.recommended.length > 0 && (
          <>
            <h3 className="mt-7 text-2xl font-semibold text-raspberry">Print these next</h3>
            <ul className="mt-2 flex flex-col gap-3">
              {report.recommended.map((r) => (
                <li key={r.href} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-petal/50 p-4">
                  <div className="min-w-[220px] flex-1">
                    <b className="text-lg">
                      {r.printable.title} · stage {r.stage}
                    </b>
                    <p className="text-sm text-grape/75">{r.why}</p>
                  </div>
                  <a href={r.href} className={buttonVariants({ size: 'sm' })}>
                    🖨 Open
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className="mt-7 text-2xl font-semibold text-raspberry">Away from the screen</h3>
        <ul className="mt-2 flex flex-col gap-1.5 text-sm">
          {report.practice.map((p) => (
            <li key={p}>👉 {p}</li>
          ))}
        </ul>

        {report.notes.length > 0 && (
          <>
            <h3 className="mt-7 text-2xl font-semibold text-raspberry">Worth knowing</h3>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {report.notes.map((n) => (
                <li key={n}>💡 {n}</li>
              ))}
            </ul>
          </>
        )}

        <footer className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
          <Button onClick={() => window.print()}>🖨 Print this report</Button>
          {email && (
            <Button variant="quiet" disabled={email.busy || email.sent} onClick={email.onSend}>
              {email.sent ? '✓ Sent' : email.busy ? 'Sending…' : `✉️ Email it to ${email.address}`}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </footer>
        {email?.error && <p className="mt-2 text-center text-sm text-raspberry print:hidden">{email.error}</p>}
      </Card>
    </div>
  );
}
