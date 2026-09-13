import { useEffect, useState } from 'react';
import { currentVoice, englishVoices, hasEnhancedVoice, nameCandidates, onVoicesChanged, say, setNameSound, setVoiceSettings, voiceSettings } from '@/features/games/sound';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/cn';
import { readJSON, writeJSON } from '@/shared/utils/storage';

/** Device-local key for how a child's name should be spoken. */
export const nameSoundKey = (childId: string) => `maths-garden:say-name:${childId}`;

/**
 * Voice settings on the grown-ups screen: a picker of this device's English voices (best first), a speed
 * slider, a "how to say the name" box, and a test button. Everything is saved on this device.
 */
export function VoicePanel({ childId, childName, bare = false }: { childId: string; childName: string; bare?: boolean }) {
  const [voices, setVoices] = useState(englishVoices);
  const [rate, setRate] = useState(() => voiceSettings().rate);
  const [voiceURI, setVoiceURI] = useState(() => currentVoice()?.voiceURI ?? '');
  const [soundsLike, setSoundsLike] = useState(() => readJSON<string | null>(nameSoundKey(childId), null) ?? '');
  const [enhanced, setEnhanced] = useState(hasEnhancedVoice);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(
    () =>
      onVoicesChanged(() => {
        setVoices(englishVoices());
        setVoiceURI(currentVoice()?.voiceURI ?? '');
        // iOS fires voiceschanged once the download finishes, so coming back from Settings flips the
        // status by itself — the one moment this check has to be right without a reload.
        setEnhanced(hasEnhancedVoice());
      }),
    [],
  );

  return (
    <section className={bare ? undefined : 'mt-8'}>
      {!bare && <h3 className="text-2xl font-semibold text-raspberry">Voice</h3>}
      <p className="mt-1 text-sm text-grape/70">Voices come from this device, so the app can only pick the best one installed here.</p>

      {/* The old version of this was one dense line of instructions, which is a good way to be ignored.
          The check is the useful half: a parent should not be sent to Settings to find out they were
          already done, nor told everything is fine while the app is using a thin system voice. */}
      <div className={cn('mt-3 rounded-[24px] p-4', enhanced ? 'bg-leaf/15' : 'bg-sunny/25')}>
        <p className="font-semibold text-grape">{enhanced ? '✨ A natural voice is installed' : '🔈 Only the basic voice is installed'}</p>
        <p className="mt-0.5 text-sm text-grape/75">
          {enhanced
            ? 'Pick it in the list below if it is not already chosen — the app prefers it automatically.'
            : 'Downloading one takes a minute and makes a bigger difference than any other setting here.'}
        </p>
        {!enhanced && (
          <Button variant="quiet" size="sm" className="mt-3" onClick={() => setShowGuide((open) => !open)} aria-expanded={showGuide}>
            {showGuide ? 'Hide the steps' : '✨ Enhance the voice'}
          </Button>
        )}
        {enhanced && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowGuide((open) => !open)} aria-expanded={showGuide}>
            {showGuide ? 'Hide the steps' : 'Add another voice'}
          </Button>
        )}
        {showGuide && (
          <div className="mt-3 rounded-[18px] bg-white/70 p-4 text-left">
            <p className="text-sm font-semibold text-grape">On the iPad, leave this open and:</p>
            <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-grape/85">
              <li>Open <b>Settings</b> (the grey cog on the home screen)</li>
              <li>Tap <b>Accessibility</b></li>
              <li>Tap <b>Spoken Content</b></li>
              <li>Tap <b>Voices</b>, then <b>English</b></li>
              <li>
                Choose <b>English (United Kingdom)</b>
              </li>
              <li>
                Tap any voice marked <b>Enhanced</b> or <b>Premium</b> — the ⬇︎ downloads it (about 100&nbsp;MB, needs wi-fi)
              </li>
              <li>Come back here and pick it in the list below, then tap 🔊 Test the voice</li>
            </ol>
            <p className="mt-3 text-sm text-grape/60">
              Not on an iPad? The same idea works on a Mac (System Settings → Accessibility → Spoken Content) and on Android (Settings → Accessibility →
              Text-to-speech).
            </p>
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-semibold">Voice</span>
          <select
            className="h-12 rounded-2xl border-2 border-petal bg-white px-3 text-grape outline-none focus:border-bubble"
            value={voiceURI}
            onChange={(e) => {
              setVoiceSettings({ voiceURI: e.target.value || null });
              setVoiceURI(e.target.value);
            }}
          >
            {voices.length === 0 && <option value="">Device default</option>}
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-semibold">Speed</span>
          <input
            type="range"
            min={0.6}
            max={1.1}
            step={0.05}
            value={rate}
            className="accent-bubble"
            onChange={(e) => {
              const next = Number(e.target.value);
              setRate(next);
              setVoiceSettings({ rate: next });
            }}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold">How to say “{childName}”</span>
          {/* Tap to hear, tap again to keep. There is no phoneme control to reach for — Safari's speech API
              takes no SSML — so respelling is the only lever, and which respelling works depends on the
              voice installed here. That cannot be decided in code, but it is two taps by ear. */}
          <span className="text-sm text-grape/60">Tap one to hear it. The ticked one is what she'll be called.</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {nameCandidates(childName).map((candidate) => {
              const chosen = candidate === (soundsLike || childName);
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => {
                    const next = candidate === childName ? '' : candidate;
                    setSoundsLike(next);
                    writeJSON(nameSoundKey(childId), next || null);
                    setNameSound(childName, next);
                    say(`Well done ${childName}!`);
                  }}
                  className={cn(
                    'rounded-full border-2 px-4 py-2 text-lg transition-colors',
                    chosen ? 'border-bubble bg-bubble/15 font-semibold text-raspberry' : 'border-petal bg-white text-grape',
                  )}
                >
                  {chosen ? '✓ ' : '🔊 '}
                  {candidate}
                </button>
              );
            })}
          </div>
          <label className="mt-2 flex flex-col gap-1.5">
            <span className="text-sm text-grape/70">Or spell it yourself</span>
            <Input
              value={soundsLike}
              placeholder="e.g. Tah-ra or Tarra"
              onChange={(e) => {
                setSoundsLike(e.target.value);
                writeJSON(nameSoundKey(childId), e.target.value.trim() || null);
                setNameSound(childName, e.target.value);
              }}
            />
          </label>
        </div>
        <Button variant="quiet" onClick={() => say(`Well done ${childName}! Find the number seven.`)}>
          🔊 Test the voice
        </Button>
      </div>
    </section>
  );
}
