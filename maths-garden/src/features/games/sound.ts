/**
 * Beeps (Web Audio) and a British voice (speech synthesis). iOS only allows both after a tap, so call
 * unlockAudio() inside the tap handler that starts a game.
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

let voice: SpeechSynthesisVoice | null = null;

const pickVoice = () => {
  const voices = speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === 'en-GB' && /female|Kate|Serena|Stephanie|Martha/i.test(v.name)) ??
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
};

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

if (canSpeak()) {
  speechSynthesis.addEventListener('voiceschanged', pickVoice);
  pickVoice();
}

export function say(text: string) {
  if (!canSpeak()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 0.88;
    u.pitch = 1.15;
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
