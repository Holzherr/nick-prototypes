import { ARTICLES } from './articles';

export interface FaqItem {
  question: string;
  answer: string;
  /** Optional link out to a guide or page. */
  link?: { href: string; label: string };
}

/** Straight answers to what a parent actually asks before signing up. */
export const FAQ: readonly FaqItem[] = [
  {
    question: 'Is it really free?',
    answer:
      'Yes. Every printable and every game is free, with no ads, no in-app purchases and nothing behind a paywall. It was built for one four-year-old and costs almost nothing to run, so there is no business model to protect.',
  },
  {
    question: 'What age is it for?',
    answer:
      'Roughly three to six. The games start at "how many dots, one two or three" and go up to comparing numbers to twenty and adding on. The printables cover the same three stages, so a child who is ahead or behind simply sits at a different stage.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'Not for the printables — they open and print with no sign-in at all. For the games, guest mode plays straight away and keeps progress on that device. A free parent account is what makes progress follow your child between devices and lets you see how they are doing.',
  },
  {
    question: 'How much screen time is this?',
    answer:
      'A round is five questions, about two minutes. The daily goal is three rounds, so roughly ten minutes, and the app suggests a break if your child plays a lot, quits twice or suddenly slows down. That sits inside WHO and AAP guidance for this age — deliberately.',
    link: { href: `#/guides/${ARTICLES[1].slug}`, label: 'What the research says about gamified learning' },
  },
  {
    question: 'Is this a curriculum?',
    answer:
      'No. It covers six early-number skills — subitising, counting objects, numerals, comparison, adding on and rote counting — each in three stages, following the order the research says children actually learn them in. It is practice and assessment for the early number strand, not a full maths scheme, and certainly not school.',
    link: { href: `#/guides/${ARTICLES[0].slug}`, label: 'The stages of early maths and reading' },
  },
  {
    question: 'How does it know what to give my child next?',
    answer:
      'Every round is scored, and answer speed is recorded as well as accuracy. A quick perfect round moves a game up a level; two in a row at 80% or better does the same unless both were slow, in which case it holds to build fluency. Two rounds under 50% drop it back, and after two misses in a row the next question quietly comes from the level below.',
  },
  {
    question: 'What are the printables for?',
    answer:
      'They are the actual teaching. Paper first, away from the screen: dot cards, counting mats, numeral tracing, a number hunt, comparison cards, a story board and a number track. The games then check whether it stuck and tell you which stage to print next. Each sheet has a QR code that opens the matching game.',
    link: { href: '#/resources', label: 'Browse the free printables' },
  },
  {
    question: 'Do I need a printer?',
    answer: 'No. The games work on their own. The loop is better with paper, and a library or a friend’s printer is plenty — nothing needs colour or card.',
  },
  {
    question: 'Will it work on an iPad, and offline?',
    answer:
      'Yes. Open it in Safari or Chrome and add it to the home screen; it then behaves like an app, works offline, and uploads progress when it is back online. There is nothing to install from an app store.',
  },
  {
    question: 'What happens to our data?',
    answer:
      'Accounts and progress live in a Supabase database in Europe, and database rules mean a parent can only ever read their own children’s rows. There are no ads, no trackers, no analytics on the children’s side and nothing is sold or shared. Guest mode keeps everything on the device and sends nothing anywhere. Children need no email address, no name beyond what you type, and no photo.',
  },
  {
    question: 'Does my child get pestered to come back?',
    answer:
      'No notifications, no streaks to lose, no leaderboards and no other children to be compared against. Rounds end on their own, and the app is happy to suggest stopping.',
  },
  {
    question: 'Who made this?',
    answer:
      'A parent, for his daughter Tara, because the good printables were all behind subscriptions and the free games were full of adverts. It is shared as-is, in the hope it is useful. It is not a school, a tutor or clinical advice.',
  },
];
