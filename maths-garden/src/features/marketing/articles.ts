/**
 * The guides behind the FAQ. Long-form, written for parents, and tied to sources a parent can actually go
 * and read. Kept as data so the renderer stays dumb and the claims stay in one place.
 */

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'steps'; items: { title: string; text: string }[] }
  | { kind: 'callout'; title: string; text: string }
  | { kind: 'table'; caption?: string; head: string[]; rows: string[][] }
  /** The scoring and levelling diagram, shared with the progress screen so they can never drift apart. */
  | { kind: 'diagram' };

export interface Reference {
  text: string;
  href?: string;
}

export interface Article {
  slug: string;
  title: string;
  standfirst: string;
  emoji: string;
  minutes: number;
  updated: string;
  blocks: Block[];
  references: Reference[];
}

const STAGES: Article = {
  slug: 'stages',
  title: 'What comes first: the stages of early maths and reading',
  standfirst:
    'Children do not learn maths or reading in one go — both run along a fairly well-mapped sequence. Knowing where your child is on it is worth more than any worksheet.',
  emoji: '🪜',
  minutes: 9,
  updated: '2026-09-12',
  blocks: [
    {
      kind: 'p',
      text: 'The single most useful thing a parent can know is not an activity. It is the order things come in. Children learn early maths and early reading along developmental progressions — sequences that are broadly the same for everyone, run at wildly different speeds, and cannot easily be skipped. Douglas Clements and Julie Sarama call these learning trajectories: a description of how children actually think at each level, plus the tasks that move them to the next one. Teaching the level a child is on works. Teaching the level printed on the box does not.',
    },
    {
      kind: 'callout',
      title: 'The short version',
      text: 'Find the last step your child can do without help. Work on the next one. Ignore their age, and ignore what the child next door is doing.',
    },

    { kind: 'h', text: 'Early maths, in order' },
    {
      kind: 'p',
      text: 'Number is not one skill, it is about six, and they build on each other. This is the sequence most early-years frameworks and the research behind them agree on for roughly ages three to six.',
    },
    {
      kind: 'steps',
      items: [
        {
          title: '1. Subitising — seeing how many without counting',
          text: 'Recognising one, two or three at a glance, the way you read a dice. Clements and Sarama distinguish perceptual subitising (just seeing three) from conceptual subitising (seeing seven as four and three) — and the second one is where early arithmetic starts. This is the earliest number skill and the one most often skipped.',
        },
        {
          title: '2. Counting, properly',
          text: 'Reciting "one two three" is not counting. Counting objects means one number word per object, always in the same order, and understanding that the last number you said is the answer — the cardinal principle. Gelman and Gallistel set these out as the counting principles in 1978 and they have held up: one-to-one, stable order, cardinality, abstraction and order-irrelevance. Most four-year-olds can recite further than they can count.',
        },
        {
          title: '3. Numerals — the written symbols',
          text: 'Matching the shape "5" to five things. This is a separate, arbitrary learning job: nothing about the squiggle tells you it means five. Expect 6 and 9 to swap, and the teens to be a war zone (children hear "thirteen" and reasonably write 31).',
        },
        {
          title: '4. Comparison — more, fewer, the same',
          text: 'First with obvious differences, then with close ones, then with groups that look misleading (five spread out vs six bunched up). "Fewer" is much harder than "more" and comes later.',
        },
        {
          title: '5. Adding on — counting on rather than starting again',
          text: 'The leap is not addition, it is strategy. A child who has four and gets one more, and recounts from one, has not made it yet. A child who says "four… five!" has. That shift is one of the clearest signs of progress at this age.',
        },
        {
          title: '6. Number bonds and place value',
          text: 'Knowing that 3 and 2 make 5 without counting, and that the teens are ten-and-something. This is where reception and year one go, and it depends on everything above being solid.',
        },
      ],
    },
    {
      kind: 'p',
      text: 'It matters more than it looks. Nancy Jordan and colleagues have followed children from kindergarten onward and found early number competence — counting, number knowledge and simple number operations — predicts mathematics achievement years later, even after controlling for reading, age and general cognitive ability. In their work, early number sense accounted for around a third of the variance in first-grade maths achievement. Early gaps do not close on their own.',
    },
    {
      kind: 'p',
      text: 'On what actually helps, the Education Endowment Foundation’s guidance for ages three to seven is refreshingly ordinary: weave maths into the day (snack time, stairs, laying the table), use stories and picture books, play board games with a number track, balance short bits of structured teaching with play, and get children to explain their thinking out loud. Snakes and ladders is a maths intervention with better evidence than most apps.',
    },

    { kind: 'h', text: 'Early reading, in order' },
    {
      kind: 'p',
      text: 'Reading has an equally well-mapped path, and a useful framing: the Simple View of Reading (Gough and Tunmer, 1986) says reading comprehension is word recognition multiplied by language comprehension. Multiplied, not added — if either is zero, reading is zero. Hollis Scarborough’s reading rope (2001) unpicks those two strands into the threads that have to be woven together: phonological awareness, decoding and sight recognition on one side; vocabulary, background knowledge, language structure and reasoning on the other.',
    },
    {
      kind: 'steps',
      items: [
        {
          title: '1. Oral language and vocabulary',
          text: 'Long before letters. Talking, being talked to, stories, songs, silly rhymes. This strand is the ceiling on comprehension later, and it is built years before a child reads a word.',
        },
        {
          title: '2. Phonological and then phonemic awareness',
          text: 'Hearing that "cat" and "hat" rhyme, clapping syllables, then the hard one: hearing that "cat" is c-a-t. Phonemic awareness is auditory — it can be done in the dark, with no print at all.',
        },
        {
          title: '3. Letter–sound knowledge and decoding',
          text: 'Linking sounds to letters and blending them. Systematic phonics is the best-evidenced part of early reading teaching: the EEF puts phonics approaches at around five months’ additional progress on average, and more effective than whole-language alternatives for beginners.',
        },
        {
          title: '4. Fluency',
          text: 'Decoding stops being effortful and words are recognised instantly. Linnea Ehri describes the phases: pre-alphabetic (guessing from pictures and shapes), partial alphabetic (using some letters), full alphabetic (properly decoding), then consolidated alphabetic (chunks like -tion and -ing read as units). Fluency is the bridge, and it is built by reading a lot of text that is slightly too easy.',
        },
        {
          title: '5. Comprehension',
          text: 'Which is not a skill you can drill directly — it rides on vocabulary, knowledge of the world and language structure. A child who can decode every word of a text about a harvest festival and knows nothing about harvest festivals will not understand it.',
        },
      ],
    },
    {
      kind: 'p',
      text: 'Castles, Rastle and Nation’s 2018 review is the best single summary of where this settled after decades of argument: systematic phonics for beginners is not seriously in dispute, it is necessary but not sufficient, and the interesting questions are all about what happens after decoding. The EEF makes the same point from the other end — early literacy in the pre-school years is more than just phonics, and combining approaches beats any single one.',
    },

    { kind: 'h', text: 'Roughly when' },
    {
      kind: 'p',
      text: 'Ages here are a loose guide, not a target. The spread between two entirely typical children is well over a year, and sequence matters more than timing.',
    },
    {
      kind: 'table',
      caption: 'Typical, not prescriptive. Work on the next step, whatever the age says.',
      head: ['Roughly', 'Maths', 'Reading'],
      rows: [
        ['3–4', 'Subitising 1–3, counting small sets, "more"', 'Rhyme, syllables, loving stories, some letter names'],
        ['4–5', 'Counting to 10 with meaning, numerals 0–10, comparing', 'Hearing first sounds, letter–sound links, pre/partial alphabetic'],
        ['5–6', 'Counting on, bonds within 10, teens as ten-and-some', 'Blending and decoding simple words, full alphabetic'],
        ['6–7', 'Bonds to 20, place value, simple written arithmetic', 'Fluency growing, consolidated chunks, comprehension takes over'],
      ],
    },

    { kind: 'h', text: 'What this means at home' },
    {
      kind: 'list',
      items: [
        'Find the edge, not the age. The right task is the one they get right about four times in five.',
        'Five minutes often beats an hour occasionally. Both literatures agree on this and no parent believes it until they try it.',
        'Real objects before pictures, pictures before symbols. Grapes, then dots, then the numeral.',
        'Talk. "How did you know?" is the most valuable question in both subjects.',
        'Do not skip subitising or phonemic awareness because they look too easy. They are the foundations that later work quietly depends on.',
        'Stop while it is still fun. The aim at four is that maths and books feel like things we do, not things we get tested on.',
      ],
    },
    {
      kind: 'callout',
      title: 'A caveat',
      text: 'I am a parent who reads the research, not a researcher or a teacher. Effect sizes are averages across many children and tell you little about yours. If something feels wrong — a child who is miserable, or stuck for months — talk to their teacher or GP rather than to a website.',
    },
  ],
  references: [
    {
      text: 'Clements, D. & Sarama, J. — Learning trajectories in early mathematics: sequences of acquisition and teaching (Encyclopedia on Early Childhood Development)',
      href: 'https://www.child-encyclopedia.com/pdf/expert/numeracy/according-experts/learning-trajectories-early-mathematics-sequences-acquisition-and',
    },
    { text: 'Gelman, R. & Gallistel, C. R. (1978). The Child’s Understanding of Number. Harvard University Press — the five counting principles.' },
    {
      text: 'Jordan, N. et al. (2010). The importance of number sense to mathematics achievement in first and third grades. Learning and Individual Differences',
      href: 'https://www.sciencedirect.com/science/article/abs/pii/S1041608009000533',
    },
    {
      text: 'Education Endowment Foundation — Improving Mathematics in the Early Years and Key Stage 1 (guidance report, 2020)',
      href: 'https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/early-maths',
    },
    {
      text: 'Castles, A., Rastle, K. & Nation, K. (2018). Ending the Reading Wars: Reading Acquisition From Novice to Expert. Psychological Science in the Public Interest',
      href: 'https://journals.sagepub.com/doi/10.1177/1529100618772271',
    },
    { text: 'Ehri, L. (2023). Phases of Development in Learning to Read and Spell Words. American Educator', href: 'https://www.aft.org/ae/fall2023/ehri' },
    { text: 'Scarborough’s Reading Rope (2001) and the Simple View of Reading (Gough & Tunmer, 1986)', href: 'https://www.readingrockets.org/reading-101/how-children-learn-read/models-reading' },
    { text: 'Education Endowment Foundation — Phonics (Teaching and Learning Toolkit)', href: 'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/phonics' },
    { text: 'Education Endowment Foundation — Literacy in the early years: more than just phonics', href: 'https://educationendowmentfoundation.org.uk/early-years/more-than-just-phonics' },
  ],
};

const GAMIFIED: Article = {
  slug: 'gamified-learning',
  title: 'Does gamified learning work? What the research actually says',
  standfirst:
    'Games do help children learn — by a small-to-moderate amount, under conditions most apps ignore. The risks are real but they are not the ones you read about. Here is the evidence, including the parts that argue against apps like this one.',
  emoji: '🎮',
  minutes: 10,
  updated: '2026-09-12',
  blocks: [
    {
      kind: 'p',
      text: 'Two different things get called gamified learning. Game-based learning means the learning happens inside a game — you practise counting by playing something. Gamification means points, badges, streaks and levels bolted onto an activity that is not otherwise a game. They have separate evidence bases and they fail in different ways, so it is worth keeping them apart.',
    },

    { kind: 'h', text: 'What the evidence supports' },
    {
      kind: 'p',
      text: 'The most-cited meta-analysis of serious games — Wouters and colleagues, 2013, pooling 77 comparisons across more than 5,000 learners — found games beat conventional instruction for learning (d = 0.29) and for retention (d = 0.36). Notably, they were not significantly more motivating than ordinary teaching. That finding gets ignored a lot, presumably because it is inconvenient for everyone selling a game.',
    },
    {
      kind: 'p',
      text: 'For gamification specifically, Sailer and Homner’s 2020 meta-analysis found small-to-moderate positive effects on cognitive (g = 0.49), motivational (g = 0.36) and behavioural (g = 0.25) outcomes. The cognitive effect held up when they looked only at the methodologically strongest studies; the motivational and behavioural ones wobbled. In plain terms: the learning gains are more trustworthy than the "it makes them love it" claims.',
    },
    {
      kind: 'p',
      text: 'Maths games specifically come out weaker. Tokac and colleagues (2019) found a small and only marginally significant effect on maths achievement (d = 0.13) across PreK–12. For younger children there is more encouragement: a 2024 systematic review of game-based learning with three- to eight-year-olds reports moderate-to-large effects on engagement and motivation alongside cognitive gains, and a meta-analysis of touchscreen learning in young children found a meaningful overall effect (d = 0.46) with age among the significant moderators.',
    },
    {
      kind: 'callout',
      title: 'The condition everyone skips',
      text: 'Wouters found games worked best when supplemented with other instruction, spread over multiple sessions, and played with other people. The evidence is for games plus an adult, in short repeated bursts — not for handing a child a tablet.',
    },

    { kind: 'h', text: 'What the evidence warns about' },
    {
      kind: 'p',
      text: 'The first risk is the one most app makers walk straight into: rewards can eat the interest they were meant to create. Deci, Koestner and Ryan’s meta-analysis of 128 experiments found that tangible, expected rewards contingent on doing a task, finishing it, or doing it well all significantly undermined free-choice intrinsic motivation (around d = −0.4, −0.36 and −0.28 respectively). If the sticker becomes the reason to play, interest in the maths itself can fall once the stickers stop. The mitigations are known: keep rewards unexpected rather than promised, keep them informational ("you got all five") rather than controlling, and never make them the point of the exercise.',
    },
    {
      kind: 'p',
      text: 'The second is pace. Lillard and Peterson (2011) had four-year-olds watch nine minutes of a fast-cut cartoon — scene changes roughly every 11 seconds against 34 in the slower show — and measured executive function immediately afterwards. The fast-paced group did markedly worse at attention, problem-solving and delaying gratification than children who watched a slower programme or simply drew. Nine minutes. It is a small, immediate-effect study, not evidence of lasting harm, but the implication for design is clear: frantic pacing, constant cuts and non-stop stimulation cost a young child something in the twenty minutes that follow.',
    },
    {
      kind: 'p',
      text: 'Third, official guidance on quantity. WHO’s 2019 movement guidelines recommend no sedentary screen time under one, no more than an hour for two- to four-year-olds and less is better; the American Academy of Pediatrics suggests about an hour a day of high-quality material for two- to five-year-olds, watched together where possible. A few five-minute rounds sit comfortably inside that. An afternoon does not.',
    },
    {
      kind: 'h',
      text: 'About the dopamine thing',
    },
    {
      kind: 'p',
      text: 'The popular version — screens "flood" children with dopamine, apps use gambling mechanics, brains need a detox — is part real and mostly overstated. What is reasonably evidenced is that variable, unpredictable rewards (the slot-machine pattern behind social feeds and loot boxes) drive compulsive checking, and that reward circuitry adapts to repeated stimulation. What is not evidenced is a depletable reservoir of dopamine, or that a maths game with a predictable sticker at the end of a five-question round does anything of the sort. Reviews of screen time and the developing brain are blunt that the literature is early, heterogeneous and mostly cross-sectional, and much of it is done with adolescents and social media rather than four-year-olds and educational apps.',
    },
    {
      kind: 'p',
      text: 'So the useful question is not "does it release dopamine" — everything enjoyable does — but "is this designed to be hard to stop?" Infinite scroll, random rewards, streaks you lose, timers pressuring you back, and no natural end point are the features to avoid. A finite round with a predictable ending is a different object from a feed.',
    },
    {
      kind: 'p',
      text: 'Fourth, and most damning for the app stores: most "educational" apps are not. Hirsh-Pasek and colleagues (2015) set out four pillars from the science of learning — active (minds-on, not just tapping), engaged (without distracting bells and whistles), meaningful (connected to what the child already knows), and socially interactive — and content analyses using that framework find the typical top-selling children’s app scores poorly. A badge is not a pillar.',
    },

    { kind: 'h', text: 'How we tried to apply this' },
    {
      kind: 'p',
      text: 'Maths Garden is a family project, not a trial, and nothing here has been evaluated. But the design choices follow the evidence above rather than engagement metrics:',
    },
    {
      kind: 'list',
      items: [
        'Rounds are five questions and end. There is no endless mode, no timer pushing the next round, and no way to lose anything by stopping.',
        'The daily goal is three rounds — roughly ten minutes — and the app suggests a break when a child plays a lot, quits twice, or suddenly slows down.',
        'Stickers are predictable: one per finished round, no random rarity, no loot boxes, nothing purchasable. A sparkly one comes with a perfect round or the daily goal, so the reward tracks the achievement rather than chance.',
        'Difficulty tracks accuracy and speed so the child sits near four-in-five right, which is roughly where effort feels worthwhile rather than crushing.',
        'The printables come first and the games check them. Screen time is the smaller half of the loop on purpose, and the parent report pushes you back to paper and real objects.',
        'No ads, no purchases, no leaderboards, no other children to compare against, and no notifications.',
      ],
    },
    {
      kind: 'callout',
      title: 'The honest summary',
      text: 'A good game is worth roughly a few months of extra progress in the literature, mostly when an adult is involved and sessions are short. It is not worth more than talking to your child, counting things together, and reading with them. Treat any app — this one included — as the practice, not the teaching.',
    },
  ],
  references: [
    {
      text: 'Wouters, P., van Nimwegen, C., van Oostendorp, H. & van der Spek, E. (2013). A meta-analysis of the cognitive and motivational effects of serious games. Journal of Educational Psychology',
      href: 'https://eric.ed.gov/?id=EJ1008015',
    },
    { text: 'Sailer, M. & Homner, L. (2020). The Gamification of Learning: a Meta-analysis. Educational Psychology Review', href: 'https://eric.ed.gov/?id=EJ1245270' },
    { text: 'Tokac, U., Novak, E. & Thompson, C. (2019). Effects of game-based learning on students’ mathematics achievement: a meta-analysis', href: 'https://eric.ed.gov/?id=EJ1214508' },
    {
      text: 'Game-based learning in early childhood education: a systematic review and meta-analysis (2024), Frontiers in Psychology',
      href: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1307881/full',
    },
    { text: 'Xie, H. et al. (2018). Can touchscreen devices be used to facilitate young children’s learning? A meta-analysis', href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6305619/' },
    {
      text: 'Deci, E., Koestner, R. & Ryan, R. (1999). A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation. Psychological Bulletin',
      href: 'https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf',
    },
    {
      text: 'Lillard, A. & Peterson, J. (2011). The immediate impact of different types of television on young children’s executive function. Pediatrics (summary)',
      href: 'https://www.sciencedaily.com/releases/2011/09/110912075658.htm',
    },
    {
      text: 'Hirsh-Pasek, K., Zosh, J. et al. (2015). Putting Education in “Educational” Apps: Lessons From the Science of Learning. Psychological Science in the Public Interest',
      href: 'https://kathyhirshpasek.com/wp-content/uploads/sites/9/2019/07/apps.pdf',
    },
    { text: 'WHO (2019) guidelines on screen time for children under five (summary)', href: 'https://www.aoa.org/news/clinical-eye-care/public-health/screen-time-for-children-under-5' },
    {
      text: 'The Developing Brain in the Digital Era: a scoping review of screen time correlates (2021), Frontiers in Psychology',
      href: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.671817/full',
    },
  ],
};

const SCORING: Article = {
  slug: 'how-it-scores',
  title: 'How it scores your child, and decides when to move up',
  standfirst:
    'No black box: five rules, two measurements and a round of five questions. Here is exactly what is measured, what moves a level, what is stored, and what the charts in the grown-ups screen are showing you.',
  emoji: '📈',
  minutes: 7,
  updated: '2026-09-12',
  blocks: [
    {
      kind: 'p',
      text: 'Most children’s apps either level up on a timer or keep the logic hidden. This one keeps it simple enough to print on a card, because a parent should be able to disagree with it. A round is five questions. Every answer is marked right or wrong and timed from the moment the answer buttons appear. Those two numbers — accuracy and speed — decide everything.',
    },
    { kind: 'h', text: 'The whole thing on one page' },
    { kind: 'diagram' },
    { kind: 'h', text: 'Why speed is in there at all' },
    {
      kind: 'p',
      text: 'Because accuracy alone hides the difference between knowing something and working it out. A child who counts on her fingers every time gets five out of five and is not fluent; the same child a month later answers in two seconds because the fact is simply known. Moving her up on accuracy alone would take away the practice that builds that fluency. So a perfect round moves up immediately — unless the answers were slow, in which case the level holds and the questions stay where they are until they come faster.',
    },
    {
      kind: 'p',
      text: 'The target time varies by question. Counting eight butterflies should take longer than recognising three dots, so the expected time for Count With Me grows with the number, while Quick Peek expects an answer in about two and a half seconds — if you are counting the dots, you are not subitising them.',
    },
    { kind: 'h', text: 'Why it aims for about four out of five' },
    {
      kind: 'p',
      text: 'The rules keep a child hovering around 80% right, which is deliberate. Work that is too easy teaches nothing and bores; work that is mostly wrong teaches that maths is something you fail at. Robert and Elizabeth Bjork’s work on "desirable difficulties" is the useful framing here: the conditions that make practice feel harder in the moment — spacing it out, mixing things up, having to retrieve rather than recognise — are often the ones that make it stick. Short rounds a few times a week beat one long session for the same reason.',
    },
    {
      kind: 'callout',
      title: 'What a level is not',
      text: 'It is not a score, a rank or a year group. Levels 1–3 map onto the three printable stages, and levels 4 and 5 are stretch. A child is routinely on level 3 for counting and level 1 for adding — that is normal and the app treats each skill separately.',
    },
    { kind: 'h', text: 'What is actually stored' },
    {
      kind: 'p',
      text: 'Enough to draw an honest picture, and nothing else. For each round: which game, which level, the score, when it was played, whether it was finished, and the biggest number that level could ask. For each question: what was asked, what was tapped, right or wrong, how long the answer took, and — where the game has them — how many objects were touched while counting or how often the number was replayed. Level changes are recorded as events, with whether the rule earned it, a poor run dropped it, or a grown-up overrode it.',
    },
    {
      kind: 'p',
      text: 'There are no adverts, no analytics and no third parties. A child needs no email address and no surname. Guest mode keeps everything on the device and sends nothing anywhere.',
    },
    { kind: 'h', text: 'What the charts show' },
    {
      kind: 'steps',
      items: [
        { title: 'Accuracy by week', text: 'The share of questions right, bucketed by week. It should stay roughly flat around 80% — because when it climbs, the level moves up and the questions get harder again.' },
        { title: 'Seconds per answer', text: 'The median time to answer. This is the line that should fall. A falling time at steady accuracy is fluency, and it is the clearest evidence of real progress.' },
        { title: 'Days played', text: 'A square per day. Frequency matters far more than session length at this age, so gaps are more informative than any single score.' },
        { title: 'Level over time', text: 'Where each skill has sat, and every move with its reason. Drops are not failures — they are the app putting the work back where it belongs.' },
        { title: 'Every number asked', text: 'Each number your child has been asked, coloured by how it goes. This is the most directly useful panel: it tells you what to put on the table tonight.' },
      ],
    },
    {
      kind: 'callout',
      title: 'If you disagree with it',
      text: 'Override it. The grown-ups screen has − / + per skill and a "make everything harder" button, and your change is recorded as yours rather than quietly overwritten by the next round. You know things the round log does not.',
    },
  ],
  references: [
    { text: 'Bjork, R. & Bjork, E. — Desirable difficulties: making learning conditions harder to make learning last', href: 'https://bjorklab.psych.ucla.edu/research/' },
    { text: 'Cepeda, N. et al. (2006). Distributed practice in verbal recall tasks: a review and quantitative synthesis. Psychological Bulletin', href: 'https://pubmed.ncbi.nlm.nih.gov/16719566/' },
    { text: 'Education Endowment Foundation — Feedback (Teaching and Learning Toolkit)', href: 'https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback' },
    {
      text: 'Clements, D. & Sarama, J. — Learning trajectories in early mathematics, the sequence the levels follow',
      href: 'https://www.child-encyclopedia.com/pdf/expert/numeracy/according-experts/learning-trajectories-early-mathematics-sequences-acquisition-and',
    },
  ],
};

export const ARTICLES: readonly Article[] = [STAGES, GAMIFIED, SCORING];

export const articleBySlug = (slug: string): Article | undefined => ARTICLES.find((a) => a.slug === slug);
