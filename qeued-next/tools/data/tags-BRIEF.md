# Qeued tone & theme tagging brief

Qeued ranks recommendations on five axes. Two of them — tone and theme — are currently
inferred from genre overlap, which cannot tell a bleak procedural from a warm family
comedy once both are filed under "Drama". You are producing the evidence those two axes
should use instead.

Tags are only useful if two titles that feel alike get the same word. So the vocabulary is
CLOSED: use these exact strings and nothing else. No new tags, no plurals, no synonyms.

## tones — how it feels. Pick 1-3, most characteristic first.
bleak, tense, melancholy, warm, funny, playful, romantic, unsettling, uplifting, cool,
earnest, absurd

- `cool` means stylish and emotionally reserved (Drive, Le Samouraï), not "good".
- `earnest` means sincere and unironic, which is a description, not praise.
- `unsettling` is dread and wrongness; `tense` is suspense you can name the cause of.
- A comedy that is also sad takes both `funny` and `melancholy`. Don't flatten it.
- `romantic` is a real tone and belongs on anything where the love story is the engine. It is
  the *theme* `romance` that does not exist — one round read a warning about the theme as a
  ban on the tone and left every love story untagged for it.

## themes — what it is actually about. Pick 2-4.
family, marriage, parenthood, friendship, coming-of-age, grief, class, politics, war,
crime, justice, revenge, survival, workplace, ambition, faith, technology, identity,
memory, addiction, art, money, power, isolation, espionage, nature, sport, music, history,
race

- Tag what the story is *about*, not what appears in it. A heist film where the crew
  betray each other is `crime` and `friendship`, not just `crime`.
- `workplace` means the job is the setting and the subject (The Office, Halt and Catch
  Fire). `ambition` is wanting more than you have.
- `power` is who controls whom; `politics` is the machinery of the state.
- `nature` is the natural world as the subject, not merely the setting.
- `sport` is competition and what it costs; `music` is music-making, not a soundtrack.
- `history` is a real past reckoned with, not merely a period setting.
- `race` is racism, racial identity and their consequences as a subject.
- `espionage` covers spying, intelligence work and betrayal of a service — it is a
  subject in its own right, not a flavour of `crime`.
- Two themes is a fine answer. Four is the maximum. Don't pad.

## Your input
One JSON file: slug, name, year, type, genres, and synopsis (sometimes null).

**Count the output against the input before you finish.** A file that stops early is the
single most common failure here — it has happened on six separate batches, each time with
the agent reporting that nothing was missing. Reading the input length and the output length
and comparing them takes one command and is not optional.

## Output
Write ONE JSON array to the output path you are given — no markdown fence, no commentary:

```json
[{ "slug": "parasite-2019", "tones": ["tense", "funny"], "themes": ["class", "family", "money"] }]
```

Every input slug gets exactly one output object. If a title is genuinely unfamiliar and
the synopsis is null, use WebSearch to check what it is before tagging — but don't
research titles you already know, that is wasted time.

Then reply with: the count written, any slugs you had to research, and any title you found
hard to place (one line each).
