import { readJSON, writeJSON } from '@/shared/utils/storage';

/**
 * Beeps (Web Audio) and speech (the device's own voices). iOS only allows both after a tap, so call
 * unlockAudio() inside the tap handler that starts a game. Voices differ per device: the best English
 * voice is picked automatically (downloaded Premium/Enhanced voices first) and a grown-up can override it.
 */
let ctx: AudioContext | null = null;

const audio = () => {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  ctx = Ctor ? new Ctor() : null;
  return ctx;
};

export function tone(freqs: number[], dur = 0.14) {
  try {
    const ac = audio();
    if (!ac) return;
    freqs.forEach((f, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const start = ac.currentTime + i * dur;
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    });
  } catch {
    // sound is a nice-to-have
  }
}

export const sounds = {
  right: () => tone([660, 880, 1100]),
  wrong: () => tone([300, 240], 0.2),
  stars: () => tone([523, 659, 784, 1046], 0.12),
  tap: (n: number) => tone([440 + n * 60]),
  pop: (n: number) => tone([520 + n * 90]),
};

export interface VoiceSettings {
  /** null = pick the best voice automatically. */
  voiceURI: string | null;
  rate: number;
}

const VOICE_KEY = 'maths-garden:voice';
const NOVELTY = /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Junior|Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Grandma|Grandpa|Rocko|Shelley|Eddy|Flo|Reed|Sandy/i;

/** Ranking for English voices (−1 = not English or a novelty voice): Premium/Enhanced downloads, then British, then known good names. */
export function voiceScore(v: { name: string; lang: string }): number {
  const lang = v.lang.replace('_', '-');
  if (!lang.toLowerCase().startsWith('en') || NOVELTY.test(v.name)) return -1;
  let score = lang === 'en-GB' ? 20 : 10;
  if (/premium/i.test(v.name)) score += 40;
  else if (/enhanced|neural|natural/i.test(v.name)) score += 30;
  if (/Serena|Kate|Stephanie|Martha|Libby|Sonia|Arthur|Google UK English Female/i.test(v.name)) score += 5;
  return score;
}

let settings: VoiceSettings = { voiceURI: null, rate: 0.9, ...readJSON<Partial<VoiceSettings>>(VOICE_KEY, {}) };
let voices: SpeechSynthesisVoice[] = [];
let voice: SpeechSynthesisVoice | null = null;
const listeners = new Set<() => void>();

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export const englishVoices = () => voices.filter((v) => voiceScore(v) >= 0).sort((a, b) => voiceScore(b) - voiceScore(a));

/**
 * A downloaded high-quality voice, rather than the thin one every device ships with. The same patterns
 * voiceScore ranks by, named once so the two can never disagree.
 *
 * This matters more than any respelling: the app already picks the best voice installed, but it can only
 * choose from what is there, and on a device with nothing downloaded that is the compact system voice.
 */
export const isEnhancedVoice = (v: { name: string }) => /premium|enhanced|neural|natural/i.test(v.name);

/** Whether this device has an enhanced English voice at all — decides whether to explain how to get one. */
export const hasEnhancedVoice = () => englishVoices().some(isEnhancedVoice);

const refresh = () => {
  voices = canSpeak() ? speechSynthesis.getVoices() : [];
  voice = voices.find((v) => v.voiceURI === settings.voiceURI) ?? englishVoices()[0] ?? null;
  for (const listener of listeners) listener();
};

if (canSpeak()) {
  speechSynthesis.addEventListener('voiceschanged', refresh);
  refresh();
}

export const currentVoice = () => voice;
export const voiceSettings = () => settings;
export const onVoicesChanged = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function setVoiceSettings(patch: Partial<VoiceSettings>) {
  settings = { ...settings, ...patch };
  writeJSON(VOICE_KEY, settings);
  refresh();
}

let nameSound: { name: string; soundsLike: string } | null = null;

/** From now on, speak `name` as `soundsLike` (e.g. "Tara" as "Tah-ra"); blank clears it. */
export function setNameSound(name: string, soundsLike: string | null) {
  nameSound = soundsLike?.trim() ? { name, soundsLike: soundsLike.trim() } : null;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const swap = (text: string, name: string, soundsLike: string) => text.replace(new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi'), soundsLike);

export const pronounce = (text: string) => (nameSound ? swap(text, nameSound.name, nameSound.soundsLike) : text);

/**
 * Respellings to try for a name, best guess first.
 *
 * There is no phoneme control to reach for: Safari's speech API takes no SSML and no IPA, so respelling the
 * word is the only lever, and which respelling works depends on the voice installed on the device. That
 * cannot be decided in code — but the shortlist can be, and a grown-up settles it by ear in two taps.
 *
 * The vowel pairs are the ones that actually shift an English voice: doubling a consonant shortens the
 * vowel before it ("Tarra"), an h lengthens it ("Tahra"), and a hyphen forces two beats ("Tah-ra").
 */
export function nameCandidates(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return [];
  const out = [trimmed];
  const add = (s: string) => {
    if (s && s.toLowerCase() !== trimmed.toLowerCase() && !out.some((x) => x.toLowerCase() === s.toLowerCase())) out.push(s);
  };

  // a-stem names ("Tara", "Sara", "Clara") are the common case: short-a and long-a both sound wrong by turns.
  const m = /^([A-Za-z]+?)([aeiou])([a-z]+)$/i.exec(trimmed);
  if (m) {
    const [, head, vowel, tail] = m;
    add(`${head}${vowel}h${tail}`); // Tahra — lengthen
    add(`${head}${vowel}${tail[0]}${tail}`); // Tarra — shorten
    add(`${head}${vowel}h-${tail}`); // Tah-ra — two beats
    add(`${head}${vowel}-${tail}`); // Ta-ra
  }

  // Names ending on the vowel ("Bo", "Mia", "Noa") match nothing above — the regex needs a letter after it.
  // Left alone they offered no alternative at all, which is the one case where the chooser is useless.
  const ending = /^([A-Za-z]*?)([aeiou])$/i.exec(trimmed);
  if (ending) {
    const [, head, vowel] = ending;
    add(`${head}${vowel}h`); // Boh — hold the vowel
    add(`${head}${vowel}${vowel}`); // Boo — longer still
  }

  add(trimmed.toUpperCase());
  return out.slice(0, 5);
}

/** Speak `text` with `name` respelled as `soundsLike`, without saving that choice. For trying candidates. */
export function sayAs(text: string, name: string, soundsLike: string) {
  speak(soundsLike.trim() ? swap(text, name, soundsLike.trim()) : text);
}

export const say = (text: string) => speak(pronounce(text));

function speak(text: string) {
  if (!canSpeak()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.rate = settings.rate;
    u.pitch = 1;
    speechSynthesis.speak(u);
  } catch {
    // no voice on this device
  }
}

export const hush = () => {
  if (canSpeak()) speechSynthesis.cancel();
};

export function unlockAudio() {
  try {
    void audio()?.resume();
    if (canSpeak()) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  } catch {
    // ignore
  }
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

export const numberWord = (n: number) => WORDS[n] ?? String(n);

export const praise = (name: string, rng: () => number = Math.random) => {
  const lines = [`Well done ${name}!`, 'Brilliant!', 'Super counting!', 'Yes! Amazing!', 'You got it!', `Clever ${name}!`];
  return lines[Math.floor(rng() * lines.length)];
};
