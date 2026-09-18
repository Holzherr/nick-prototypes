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
  'garden.hideOthers': 'Hide the other games',
  'garden.oneMore': 'Or one more if you like 💗',
  'why.new': 'A new one to try! ✨',
  'why.nearly': 'One good round to level up! 🌟',
  'why.practise': 'Let’s have another go at this 💪',
  'why.today': 'Not played yet today',
  'why.stale': 'It’s been a while! 👋',
  'why.variety': 'Something different 🎲',
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
  'footer.terms': 'Terms and Conditions',
  'footer.privacy': 'Privacy Policy',
  'legal.englishOnly': 'This document is in English.',
  'legal.agreePlaying': 'By playing you agree to the',

  // ── Games ─────────────────────────────────────────────────────────────────
  'game.peek.name': 'Quick Peek',
  'game.peek.about': 'Dots flash up, then hide. Say how many without counting.',
  'game.count.name': 'Count With Me',
  'game.count.about': 'Tap each object once while counting, then pick the total.',
  'game.find.name': 'Find the Number',
  'game.find.about': 'Hears a number and taps the matching numeral.',
  'game.more.name': 'Which Has More?',
  'game.more.about': 'Two groups side by side; tap the bigger one.',
  'game.add.name': 'One More Unicorn',
  'game.add.about': 'Some unicorns, then more arrive. How many now?',
  'game.bond.name': 'Make Ten',
  'game.bond.about': 'Some spaces are filled: how many more to fill the frame? The foundation of adding.',
  'game.fewer.name': 'One Fewer',
  'game.fewer.about': 'Balloons float away. How many are left? Adding on, backwards.',
  'game.teen.name': 'Ten and Some More',
  'game.teen.about': 'A full ten frame and some loose ones: the teens as ten-and-something.',
  'game.shape.name': 'Spot the Shape',
  'game.shape.about': 'Names shapes by sight, then by counting their sides. Pentagons and hexagons from stage 3.',

  // ── Skills ────────────────────────────────────────────────────────────────
  'skill.subitising.name': 'Subitising',
  'skill.counting.name': 'Counting objects',
  'skill.numerals.name': 'Numeral recognition',
  'skill.comparison.name': 'Comparison',
  'skill.adding.name': 'Adding on',
  'skill.bonds.name': 'Number bonds',
  'skill.subtracting.name': 'Taking away',
  'skill.teens.name': 'Teen numbers',
  'skill.shapes.name': 'Shapes',
  'skill.rote.name': 'Rote counting',

  // ── Printables ────────────────────────────────────────────────────────────
  'printable.subitising-cards.title': 'Quick Peek dot cards',
  'printable.subitising-cards.description':
    'Flash cards in dice, scattered, row, five/ten-frame and two-group patterns. Add a name and a picture; answers on the back.',
  'printable.counting-mats.title': 'Counting mats',
  'printable.counting-mats.description': 'Put one object on each spot, touch and count, then say how many altogether.',
  'printable.numeral-cards.title': 'Numeral cards, tracing and a number hunt',
  'printable.numeral-cards.description': 'Big numerals with their dots, dotted numbers to trace, and a hunt for numbers around the house.',
  'printable.more-or-fewer.title': 'More or fewer? cards',
  'printable.more-or-fewer.description': 'Pairs of groups to compare: circle the one with more, cross the one with fewer.',
  'printable.unicorn-stories.title': 'One more unicorn story board',
  'printable.unicorn-stories.description': 'A field, cut-out unicorns and story lines for “and one more makes…”.',
  'printable.bond-frames.title': 'Make it! bond frames',
  'printable.bond-frames.description': 'Five and ten frames with some boxes filled: how many more to fill it? Plus a set of bond cards.',
  'printable.take-away-stories.title': 'Balloons that float away',
  'printable.take-away-stories.description': 'A sky board, cut-out balloons and story lines for “one floats away, how many are left?”.',
  'printable.teen-frames.title': 'Ten and some more cards',
  'printable.teen-frames.description': 'A full ten frame and some loose ones, with the numeral on the back: the teens as ten-and-something.',
  'printable.shape-cards.title': 'Shape cards and a shape hunt',
  'printable.shape-cards.description': 'Big shapes to name and sort, the number of sides on the back, and a hunt for shapes around the house.',
  'printable.number-track.title': 'Number track race',
  'printable.number-track.description': 'Roll, move and say the numbers along the track. Plus a track with numbers missing to fill in.',

  // ── FAQ ───────────────────────────────────────────────────────────────────
  'faq.0.question': 'Is it really free?',
  'faq.0.answer': 'Yes. Every printable and every game is free, with no ads, no in-app purchases and nothing behind a paywall. It was built for one four-year-old and costs almost nothing to run, so there is no business model to protect.',
  'faq.1.question': 'What age is it for?',
  'faq.1.answer': 'Roughly three to six. The games start at "how many dots, one two or three" and go up to comparing numbers to twenty and adding on. The printables cover the same three stages, so a child who is ahead or behind simply sits at a different stage.',
  'faq.2.question': 'Do I need an account?',
  'faq.2.answer': 'Not for the printables — they open and print with no sign-in at all. For the games, guest mode plays straight away and keeps progress on that device. A free parent account is what makes progress follow your child between devices and lets you see how they are doing.',
  'faq.3.question': 'How much screen time is this?',
  'faq.3.answer': 'A round is five questions, about two minutes. The daily goal is three rounds, so roughly ten minutes, and the app suggests a break if your child plays a lot, quits twice or suddenly slows down. That sits inside WHO and AAP guidance for this age — deliberately.',
  'faq.4.question': 'Is this a curriculum?',
  'faq.4.answer': 'No. It covers six early-number skills — subitising, counting objects, numerals, comparison, adding on and rote counting — each in three stages, following the order the research says children actually learn them in. It is practice and assessment for the early number strand, not a full maths scheme, and certainly not school.',
  'faq.5.question': 'How does it know what to give my child next?',
  'faq.5.answer': 'Every round is scored, and answer speed is recorded as well as accuracy. A quick perfect round moves a game up a level; two in a row at 80% or better does the same unless both were slow, in which case it holds to build fluency. Two rounds under 50% drop it back, and after two misses in a row the next question quietly comes from the level below.',
  'faq.6.question': 'What are the printables for?',
  'faq.6.answer': 'They are the actual teaching. Paper first, away from the screen: dot cards, counting mats, numeral tracing, a number hunt, comparison cards, a story board and a number track. The games then check whether it stuck and tell you which stage to print next. Each sheet has a QR code that opens the matching game.',
  'faq.7.question': 'Do I need a printer?',
  'faq.7.answer': 'No. The games work on their own. The loop is better with paper, and a library or a friend’s printer is plenty — nothing needs colour or card.',
  'faq.8.question': 'Will it work on an iPad, and offline?',
  'faq.8.answer': 'Yes. Open it in Safari or Chrome and add it to the home screen; it then behaves like an app, works offline, and uploads progress when it is back online. There is nothing to install from an app store.',
  'faq.9.question': 'What happens to our data?',
  'faq.9.answer': 'Accounts and progress live in a Supabase database in Europe, and database rules mean a parent can only ever read their own children’s rows. There are no ads, no trackers and no third parties, and nothing is sold or shared. We do count anonymous page views and taps in that same database — how many people arrive, sign up and play — with no cookies, no profile, no identifier that outlives the browser tab, and never a child’s name or picture. Guest mode keeps everything on the device and sends nothing anywhere, counting included. Children need no email address, no name beyond what you type, and no photo.',
  'faq.10.question': 'Does my child get pestered to come back?',
  'faq.10.answer': 'No notifications, no streaks to lose, no leaderboards and no other children to be compared against. Rounds end on their own, and the app is happy to suggest stopping.',
  'faq.11.question': 'Who made this?',
  'faq.11.answer': 'A parent, for his daughter Tara, because the good printables were all behind subscriptions and the free games were full of adverts. It is shared as-is, in the hope it is useful. It is not a school, a tutor or clinical advice.',
} as const satisfies Record<string, string | Plural>;

export type StringKey = keyof typeof EN;

/** What a translation of the app looks like: every key optional, same shapes. */
export type Catalogue = { [K in StringKey]: (typeof EN)[K] extends string ? string : Plural };
