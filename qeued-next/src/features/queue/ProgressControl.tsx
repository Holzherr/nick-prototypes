import { useState } from "react";
import { Check, Plus, Tv } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { advance, nextEpisodeLabel, progressFraction, type Progress } from "./model";

type Props = {
  progress: Progress;
  onChange: (next: { current_season: number; current_episode: number }) => void | Promise<void>;
  compact?: boolean;
};

/**
 * Where you are in a series, and one tap to move on.
 *
 * "Watching" as a single flag can't answer the only question that matters on a Tuesday
 * evening — which episode is next. Episodes are stored as the last one watched, so the
 * label is always one ahead of the record.
 */
export const ProgressControl = ({ progress, onChange, compact = false }: Props) => {
  const [editing, setEditing] = useState(false);
  const [season, setSeason] = useState(String(progress.current_season ?? 1));
  const [episode, setEpisode] = useState(String(progress.current_episode ?? 0));

  const upNext = nextEpisodeLabel(progress);
  const fraction = progressFraction(progress);

  const save = async () => {
    const s = Math.max(1, Number(season) || 1);
    const e = Math.max(0, Number(episode) || 0);
    await onChange({ current_season: s, current_episode: e });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-end gap-2">
        <label className="text-xs text-muted-foreground">
          Season
          <Input value={season} onChange={(e) => setSeason(e.target.value)} inputMode="numeric" className="mt-1 h-9 w-16" />
        </label>
        <label className="text-xs text-muted-foreground">
          Episode
          <Input value={episode} onChange={(e) => setEpisode(e.target.value)} inputMode="numeric" className="mt-1 h-9 w-16" />
        </label>
        <Button size="sm" onClick={save}><Check className="h-4 w-4" /></Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "space-y-2"}>
      <div className="flex items-center gap-2">
        <Tv className="h-4 w-4 text-muted-foreground" />
        <button type="button" onClick={() => setEditing(true)} className="text-sm hover:underline">
          {upNext ? <>Up next <strong>{upNext}</strong></> : "Set where you are"}
        </button>
        {upNext && (
          <Button size="sm" variant="outline" onClick={() => onChange(advance(progress))}>
            <Plus className="mr-1 h-3 w-3" /> Watched it
          </Button>
        )}
      </div>
      {!compact && fraction !== null && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full bg-primary" style={{ width: `${Math.round(fraction * 100)}%` }} />
        </div>
      )}
    </div>
  );
};

export default ProgressControl;
