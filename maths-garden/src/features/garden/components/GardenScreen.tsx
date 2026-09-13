import { possessive } from '@/features/children/model';
import { Button } from '@/shared/components/ui/button';
import { POND_AT, UNICORN_AT, type Garden } from '../garden-state';
import { GardenScene } from './GardenScene';

export interface GardenScreenProps {
  childName: string;
  garden: Garden;
  /** What changed after the latest round. */
  news?: string | null;
  onPlay?: () => void;
  onHome: () => void;
}

const Chip = ({ children }: { children: React.ReactNode }) => <span className="rounded-full bg-cream px-4 py-2 text-lg font-semibold candy-petal [--candy:5px]">{children}</span>;

/** The whole garden: the scene, what is growing in it, and what grows it next. */
export function GardenScreen({ childName, garden, news, onPlay, onHome }: GardenScreenProps) {
  const stickersToGo = (n: number, what: string) => `${n} more sticker${n === 1 ? '' : 's'} ${what}`;
  // There is always a next thing, right up to the pond: a garden with nothing left to grow is a garden
  // she stops visiting.
  const next = garden.pond
    ? 'Your garden has everything in it now. Every round still grows a new flower. 🌷'
    : garden.unicorn
      ? `${garden.toNextTree > 0 ? `${garden.toNextTree} more round${garden.toNextTree === 1 ? '' : 's'} grows another tree. ` : ''}A pond appears at ${POND_AT} stickers.`
      : garden.butterflies >= 1
        ? `${stickersToGo(garden.toNextButterfly, 'brings another butterfly')}. A unicorn visits at ${UNICORN_AT}.`
        : stickersToGo(garden.toNextButterfly, 'brings a butterfly to your garden') + '.';

  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <h1 className="text-[clamp(28px,5vw,46px)] font-bold text-raspberry">{possessive(childName)} garden 🌷</h1>
      {news && <p className="rounded-full bg-sunny px-5 py-2 text-xl font-semibold">{news}</p>}

      <div className="w-full max-w-[820px] overflow-hidden rounded-[36px] bg-[#dff3ea] candy-leaf-deep [--candy:10px]">
        <GardenScene garden={garden} title={`${childName}'s garden`} />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Chip>🌸 {garden.plants.length} flowers</Chip>
        <Chip>🦋 {garden.butterflies}</Chip>
        {garden.trees > 0 && <Chip>🌳 {garden.trees}</Chip>}
        {garden.rainbow && <Chip>🌈 Daily goal!</Chip>}
        {garden.unicorn && <Chip>🦄 A unicorn!</Chip>}
        {garden.pond && <Chip>🦆 A pond!</Chip>}
      </div>
      <p className="max-w-[520px] text-lg text-grape/75">Every round you finish grows a flower — a perfect round grows a big one. {next}</p>

      <div className="flex flex-wrap justify-center gap-4">
        {onPlay && (
          <Button size="lg" onClick={onPlay}>
            Play again 💗
          </Button>
        )}
        <Button variant={onPlay ? 'quiet' : 'primary'} size="lg" onClick={onHome}>
          All games
        </Button>
      </div>
    </main>
  );
}
