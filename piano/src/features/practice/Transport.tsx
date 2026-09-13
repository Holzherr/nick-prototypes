export interface TransportProps {
  playing: boolean;
  bpm: number;
  showScore: boolean;
  showLetters: boolean;
  soundOn: boolean;
  onPrev: () => void;
  onNext: () => void;
  onHear: () => void;
  onPlayAlong: () => void;
  onRestart: () => void;
  onBpm: (value: number) => void;
  onToggleScore: () => void;
  onToggleLetters: () => void;
  onToggleSound: () => void;
}

export function Transport(p: TransportProps) {
  return (
    <div className="bar">
      <button className="ctl big" onClick={p.onPrev} title="Previous note (left arrow)">&#9664;</button>
      <button className="ctl big" onClick={p.onNext} title="Next note (right arrow)">&#9654;</button>
      <button className="ctl" onClick={p.onHear}>Hear this note</button>
      <button className="ctl play" onClick={p.onPlayAlong} title="Play along (space)">
        {p.playing ? 'Stop' : 'Play along'}
      </button>
      <button className="ctl" onClick={p.onRestart}>Start again</button>
      <div className="spacer" />
      <label className="tempo">
        Speed
        <input
          type="range"
          min={40}
          max={120}
          step={2}
          value={p.bpm}
          onChange={e => p.onBpm(Number(e.target.value))}
        />
        <b>{p.bpm}</b>
      </label>
      <div className="toggles">
        <button className="tog" aria-pressed={p.showScore} onClick={p.onToggleScore}>Sheet music</button>
        <button className="tog" aria-pressed={p.showLetters} onClick={p.onToggleLetters}>Letter names</button>
        <button className="tog" aria-pressed={p.soundOn} onClick={p.onToggleSound}>Sound</button>
      </div>
    </div>
  );
}
