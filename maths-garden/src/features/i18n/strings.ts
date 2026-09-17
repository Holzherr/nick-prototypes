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
} as const satisfies Record<string, string | Plural>;

export type StringKey = keyof typeof EN;

/** What a translation of the app looks like: every key optional, same shapes. */
export type Catalogue = { [K in StringKey]: (typeof EN)[K] extends string ? string : Plural };
