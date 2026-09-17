/**
 * Every translatable string, in English.
 *
 * This object is the source, the fallback and the contract: a catalogue for another language is typed
 * against it, so a key that gets renamed here fails the build in ten places instead of silently rendering
 * English to a Polish family. Translations are `Partial`, because a half-finished language should ship and
 * fall through rather than block on its last twenty strings.
 *
 * `{name}` is filled at render. A plural entry is an object keyed by the categories `Intl.PluralRules`
 * gives for that language; `other` is the only one every language has, so it is the only one required.
 *
 * The number that DECIDES which form to use is always called `count`, even where the sentence has other
 * numbers in it — `home.soFar` counts rounds and stickers, and it is the rounds that make it plural. A
 * catalogue that renames it silently pins the string to `other`, which is the one bug this convention exists
 * to prevent.
 */
export interface Plural {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export const EN = {
  // ── The front door ────────────────────────────────────────────────────────
  'home.namePlaceholder': 'Your name',
  'home.nameLabel': 'Your child’s name',
  'home.possessiveTitle': '{name}’s Maths Garden',
  // The name is typed INTO the heading, and languages disagree about where in the sentence it goes:
  // "Arthur's Maths Garden" puts it first, "El jardín de mates de Arthur" puts it last. So the heading is
  // prefix + field + suffix, and each language fills whichever side it needs.
  'home.titlePrefix': '',
  'home.titleSuffix': '’s Maths Garden',
  'home.pickIcon': 'Pick your icon — it changes the colours too',
  'home.changeIcon': 'Change your icon',
  'home.tapToChange': 'Tap to change ↑',
  'home.start': 'Start playing →',
  'home.needName': 'Type a name first — it goes on the printables too.',
  'home.noAccount': 'No account, no email. Everything stays on this device — you can save it to an account later.',
  'home.haveAccount': 'Already have one?',
  'home.welcomeBack': 'Welcome back, {name}',
  'home.carryOn': 'Carry on playing →',
  'home.soFar': {
    one: '{count} round played and {stickers} stickers so far, kept on this device.',
    other: '{count} rounds played and {stickers} stickers so far, kept on this device.',
  },
  'home.blurb':
    'Free printables and {games} small games for three- to six-year-olds. Print a sheet, play it together, then let the app check what stuck — it scores every round, moves your child up when they are ready, and tells you what to print next.',
  'home.browsePrintables': '🖨 Browse the printables',
  'home.noAccountNeeded': 'No account needed · no ads · works offline on an iPad',

  // ── Navigation ────────────────────────────────────────────────────────────
  'nav.freePrintables': 'Free printables',
  'nav.howItWorks': 'How it works',
  'nav.guides': 'Guides',
  'nav.faq': 'FAQ',
  'nav.signIn': 'Sign in',
  'nav.allPrintables': 'All printables →',
  'nav.home': 'Maths Garden home',

  // ── Language ──────────────────────────────────────────────────────────────
  'lang.label': 'Language',
  'lang.choose': 'Choose a language',
  'lang.readInEnglish': 'Read this in English',
  'lang.machineNotice': 'This page was translated automatically. The English version is the one the author wrote.',

  // ── The garden ────────────────────────────────────────────────────────────
  'garden.title': '{name}’s Maths Garden',
  'garden.playThis': 'Let’s play this one! 🌸',
  'garden.pickAnother': 'Or pick another game →',
  'garden.stickers': 'My stickers: {count}',
  'garden.dailyGoal': 'Daily goal: {done} of {goal} rounds',
  'garden.done': 'Done!',
  'garden.grownUps': 'Grown-ups',
  'garden.seeGarden': 'See my garden 🌷',
  'garden.myStickers': 'My stickers 📒',
  'garden.wasPlaying': '{emoji} You were playing {game}',
  'garden.carryOnWhere': '{answered} of {total} done — carry on where you stopped?',
  'garden.carryOn': 'Carry on 💗',
  'garden.startSomethingElse': 'Start something else',
  'garden.lotsOfPlaying': '🌈 What a lot of playing!',

  // ── Signing in ────────────────────────────────────────────────────────────
  'auth.grownUpsSignIn': 'Grown-ups sign in here. Your child plays without needing to, and this device stays signed in.',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
  'auth.signIn': 'Sign in',
  'auth.createAccount': 'Create account',
  'auth.oneMoment': 'One moment…',
  'auth.newHere': 'New here?',
  'auth.createOne': 'Create an account',
  'auth.alreadyHave': 'Already have an account?',
  'auth.checkEmail': 'Check your email to confirm the account, then sign in.',
  'auth.paddedStart': 'There’s a space at the start — autofill does that, and it will be rejected.',
  'auth.paddedEnd': 'There’s a space at the end — autofill does that, and it will be rejected.',
  'auth.removeIt': 'Remove it',
  'auth.freePrintables': '🖨 Free printable maths cards',
  'auth.noSignInNeeded': '(no sign-in needed)',
  'auth.guestMode': 'Guest mode',
  'auth.guestBlurb': 'Play now without an account. Progress stays on this device.',
  'auth.backToGarden': '← Maths Garden',

  // ── Playing ───────────────────────────────────────────────────────────────
  'play.home': 'Home',
  'play.playAgain': 'Play again',
  'play.allGames': 'All games',
  'play.newLevel': 'New level unlocked!',
  'play.score': 'You got {score} out of {total}',
  'play.gateTitle': 'Grown-ups only',
  'play.gateQuestion': 'What is {a} + {b}?',

  // ── Grown-ups ─────────────────────────────────────────────────────────────
  'grownUps.progressTitle': '{name}’s progress',
  'grownUps.freePrintables': '🖨 Free printables',
  'grownUps.guides': '📚 Guides for grown-ups',
  'grownUps.aboutDevice': 'about this device',
  'grownUps.signOut': 'Sign out',
  'grownUps.switchChild': 'Switch or add child',
  'grownUps.signInToSave': 'Sign in to save →',

  // ── Homepage body ─────────────────────────────────────────────────────────
  'why.paper.title': 'Paper first, screen second',
  'why.paper.text':
    'The teaching happens away from the tablet: dot cards, counting mats, tracing, a number hunt. The games are the check, not the lesson.',
  'why.level.title': 'It finds the right level',
  'why.level.text':
    'Every round is scored on accuracy and speed, so the questions sit where your child gets about four in five right — hard enough to be worth doing, easy enough to stay fun.',
  'why.next.title': 'You get told what to do next',
  'why.next.text':
    'A plain-English report says what they are good at, what needs work, and exactly which sheet to print next — emailed to you when they move up a stage.',
  'why.free.title': 'Free, and quiet',
  'why.free.text': 'No ads, no purchases, no notifications, no streaks to lose, no leaderboards. Nothing is sold and nothing needs an app store.',

  'how.title': 'How it works',
  'how.standfirst': 'One loop, repeated. Paper teaches, the game marks, the level moves, the next sheet arrives.',
  'how.print.title': 'Print',
  'how.print.text': 'Pick a skill and a stage and print the sheet. Play it at the table with real objects — five minutes is plenty.',
  'how.check.title': 'Check',
  'how.check.text': 'Scan the QR code on the sheet, or open the app. Five questions, about two minutes, scored as they go.',
  'how.moveUp.title': 'Move up',
  'how.moveUp.text': 'A quick perfect round, or two good ones, moves that skill up a level. The garden grows a flower for every round.',
  'how.nextStage.title': 'Print the next stage',
  'how.nextStage.text':
    'When a skill crosses into a new stage you get an email with the report and links to the sheets that suit them now.',

  'resources.title': 'Free resources',
  'resources.standfirst':
    'Every sheet is personalised with your child’s name and a picture they like, in three stages. The ages are typical, not targets — most children are on different stages for different skills. No sign-in, no email, no watermark.',
  'resources.stage': 'Stage {stage}',

  'games.title': 'And {games} games that mark themselves',

  'guides.title': 'Guides for grown-ups',
  'guides.standfirst': 'The research behind all of this, including the bits that argue against apps like this one.',
  'guides.minutes': '{minutes} min read →',
  'guides.englishOnly': 'The guides are in English.',

  'faq.title': 'Questions',

  'cta.title': 'Print a sheet tonight, play it tomorrow',
  'cta.text':
    'Start with the printables — they need no account at all. When you want the scores kept, the games take about ten seconds to set up.',
  'cta.printables': '🖨 Free printables',
  'cta.account': 'Create a free account',

  'footer.blurb': 'Free early-maths games and printables for three- to six-year-olds. No ads, no purchases, no paywall.',
  'footer.printables': 'Printables',
  'footer.guides': 'Guides',
  'footer.getStarted': 'Get started',
  'footer.signIn': 'Sign in or create an account',
  'footer.questions': 'Questions',
  'footer.madeBy': 'Made by a parent for his daughter. Shared as-is, and not a substitute for a teacher, tutor or clinician.',
  'footer.feedback': '💬 Tell us what you think',
} as const satisfies Record<string, string | Plural>;

export type StringKey = keyof typeof EN;

/** What a translation of the app looks like: every key optional, same shapes. */
export type Catalogue = { [K in StringKey]: (typeof EN)[K] extends string ? string : Plural };
