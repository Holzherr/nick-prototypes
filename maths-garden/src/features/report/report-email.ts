import type { StageNumber } from '@/features/curriculum/skills';
import type { SkillReport, TutorReport } from './report';

/**
 * The stage-up email: what changed, how the child is doing, and the sheets to print next — the same
 * report the grown-ups screen shows, written for an inbox. Built here so it can be tested without a mail
 * service, and sent by the `send-report` edge function.
 */

export interface ReportEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EmailContext {
  /** Absolute link to the app, so the printable links work from a phone. */
  appUrl: string;
  /** Set when a game has just crossed into a new printable stage. */
  stageUp?: { skillName: string; stage: StageNumber };
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const VERDICT_LABEL: Record<SkillReport['verdict'], string> = { strength: 'Strong', steady: 'Coming along', focus: 'Needs work', new: 'Not started' };
const VERDICT_COLOUR: Record<SkillReport['verdict'], string> = { strength: '#3d9967', steady: '#b3541e', focus: '#e0326e', new: '#6b2d5c' };

/** Printable links are relative hashes; email needs them absolute. */
const absolute = (href: string, appUrl: string) => (href.startsWith('#') ? `${appUrl}${href}` : href);

export function buildReportEmail(report: TutorReport, context: EmailContext): ReportEmail {
  const { childName, week, strengths, focus, recommended, practice, notes, skills } = report;
  const subject = context.stageUp
    ? `${childName} has moved up to stage ${context.stageUp.stage} in ${context.stageUp.skillName}`
    : `${childName}’s maths report — stage ${report.stage}`;

  const lines: string[] = [subject, '', report.headline, ''];
  lines.push(`This week: ${week.rounds} rounds on ${week.days} days (~${week.minutes} min)${week.quit ? `, ${week.quit} left early` : ''}.`, '');
  if (strengths.length) lines.push(`Strengths: ${strengths.map((s) => `${s.skill.name} (${s.pct}%)`).join(', ')}`);
  if (focus.length) lines.push(`Needs work: ${focus.map((s) => `${s.skill.name}${s.pct === null ? '' : ` (${s.pct}%)`}`).join(', ')}`);
  lines.push('', 'Print next:');
  for (const r of recommended) lines.push(`- ${r.printable.title}, stage ${r.stage}: ${r.why} ${absolute(r.href, context.appUrl)}`);
  lines.push('', 'Away from the screen:');
  for (const p of practice) lines.push(`- ${p}`);
  if (notes.length) lines.push('', 'Worth knowing:', ...notes.map((n) => `- ${n}`));
  lines.push('', `Open Maths Garden: ${context.appUrl}`);

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#6b2d5c;background:#fffdf9;padding:24px">
  <p style="margin:0 0 4px;color:#ff7bac;font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-size:13px">Maths Garden</p>
  <h1 style="margin:0 0 8px;font-size:26px;line-height:1.2;color:#e0326e">${escape(subject)}</h1>
  <p style="margin:0 0 20px;font-size:16px;line-height:1.5">${escape(report.headline)}</p>

  <div style="background:#ffe9f1;border-radius:16px;padding:14px 18px;margin-bottom:20px;font-size:15px">
    <b>This week:</b> ${week.rounds} round${week.rounds === 1 ? '' : 's'} on ${week.days} day${week.days === 1 ? '' : 's'} (~${week.minutes} min)${
      week.quit ? `, ${week.quit} left early` : ''
    }.
  </div>

  <h2 style="font-size:18px;margin:0 0 8px;color:#e0326e">How ${escape(childName)} is doing</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:22px">
    ${skills
      .map(
        (s) => `<tr>
      <td style="padding:6px 8px 6px 0;border-bottom:1px solid #ffd3e4;white-space:nowrap"><b>${escape(s.skill.emoji)} ${escape(s.skill.name)}</b></td>
      <td style="padding:6px 8px;border-bottom:1px solid #ffd3e4;color:${VERDICT_COLOUR[s.verdict]};white-space:nowrap">${VERDICT_LABEL[s.verdict]}${
        s.pct === null ? '' : ` · ${s.pct}%`
      }</td>
      <td style="padding:6px 0 6px 8px;border-bottom:1px solid #ffd3e4">${escape(s.note)}</td>
    </tr>`,
      )
      .join('')}
  </table>

  <h2 style="font-size:18px;margin:0 0 8px;color:#e0326e">Print these next</h2>
  ${recommended
    .map(
      (r) => `<div style="border:2px solid #ffd3e4;border-radius:16px;padding:14px 16px;margin-bottom:10px">
    <b style="font-size:16px">${escape(r.printable.title)} · stage ${r.stage}</b>
    <p style="margin:4px 0 10px;font-size:14px;line-height:1.45">${escape(r.why)}</p>
    <a href="${absolute(r.href, context.appUrl)}" style="display:inline-block;background:#ff7bac;color:#fff;text-decoration:none;font-weight:600;padding:9px 18px;border-radius:999px;font-size:14px">Open and print</a>
  </div>`,
    )
    .join('')}

  <h2 style="font-size:18px;margin:22px 0 8px;color:#e0326e">Away from the screen</h2>
  <ul style="margin:0 0 22px;padding-left:20px;font-size:14px;line-height:1.55">${practice.map((p) => `<li>${escape(p)}</li>`).join('')}</ul>

  ${
    notes.length
      ? `<h2 style="font-size:18px;margin:0 0 8px;color:#e0326e">Worth knowing</h2>
  <ul style="margin:0 0 22px;padding-left:20px;font-size:14px;line-height:1.55">${notes.map((n) => `<li>${escape(n)}</li>`).join('')}</ul>`
      : ''
  }

  <p style="font-size:14px"><a href="${context.appUrl}" style="color:#e0326e">Open Maths Garden</a> · free printables for every stage, no paywall.</p>
</div>`.trim();

  return { subject, html, text: lines.join('\n') };
}
