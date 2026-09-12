import { useEffect, useState } from 'react';
import { currentVoice, englishVoices, onVoicesChanged, say, setNameSound, setVoiceSettings, voiceSettings } from '@/features/games/sound';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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

  useEffect(
    () =>
      onVoicesChanged(() => {
        setVoices(englishVoices());
        setVoiceURI(currentVoice()?.voiceURI ?? '');
      }),
    [],
  );

  return (
    <section className={bare ? undefined : 'mt-8'}>
      {!bare && <h3 className="text-2xl font-semibold text-raspberry">Voice</h3>}
      <p className="mt-1 text-sm text-grape/70">
        Voices come from this device. For a natural voice on an iPad: Settings → Accessibility → Spoken Content → Voices → English (UK), download one marked
        Enhanced or Premium, then pick it here.
      </p>
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
        <label className="flex flex-col gap-1.5">
          <span className="font-semibold">How to say “{childName}”</span>
          <Input
            value={soundsLike}
            placeholder="Spell it the way it sounds, e.g. Tah-ra or Tarra"
            onChange={(e) => {
              setSoundsLike(e.target.value);
              writeJSON(nameSoundKey(childId), e.target.value.trim() || null);
              setNameSound(childName, e.target.value);
            }}
          />
          <span className="text-sm text-grape/60">Leave blank to use the name as written.</span>
        </label>
        <Button variant="quiet" onClick={() => say(`Well done ${childName}! Find the number seven.`)}>
          🔊 Test the voice
        </Button>
      </div>
    </section>
  );
}
