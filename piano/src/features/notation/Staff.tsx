import { useEffect, useRef } from 'react';
import { barCount, letterOf } from '@/features/score/music.ts';
import type { Piece } from '@/features/score/types.ts';
import { layout, STAFF, staffHeight, staffWidth } from './layout.ts';

export interface StaffProps {
  piece: Piece;
  current: number;
  played: boolean[];
  showLetters?: boolean;
  onSelect: (index: number) => void;
}

const TREBLE_CLEF = '\u{1D11E}';
const BASS_CLEF = '\u{1D122}';

/** The grand staff as one continuous line that scrolls to follow her, rather
 *  than wrapping into systems: wrapping puts a jump in the middle of a piece
 *  she is still learning to read left-to-right. */
export function Staff({ piece, current, played, showLetters = true, onSelect }: StaffProps) {
  const box = useRef<HTMLDivElement>(null);
  const laid = layout(piece);
  const bars = barCount(piece);
  const w = staffWidth(piece);
  const h = staffHeight();
  const oy = STAFF.top;
  const staffEndX = STAFF.pad + bars * STAFF.barWidth;

  /* keep the current note in view */
  useEffect(() => {
    const el = box.current;
    const note = laid[current];
    if (!el || !note) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = Math.max(0, Math.min(max, note.x * STAFF.zoom - el.clientWidth / 2));
  }, [current, laid]);

  const lines = (top: number) =>
    [0, 1, 2, 3, 4].map(i => (
      <line key={`${top}-${i}`} className="stave" x1={14} y1={oy + top + i * 10} x2={staffEndX} y2={oy + top + i * 10} />
    ));

  return (
    <div className={`score${showLetters ? '' : ' noletters'}`} ref={box}>
      <svg
        width={Math.round(w * STAFF.zoom)}
        height={Math.round(h * STAFF.zoom)}
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`${piece.title}, grand staff`}
      >
        {lines(STAFF.trebleTop)}
        {lines(STAFF.bassTop)}
        <path className="brace" d={`M15 ${oy + 2}q-7 65 0 128`} />
        <text className="clef" x={24} y={oy + 32}>{TREBLE_CLEF}</text>
        <text className="clef" x={24} y={oy + 106} style={{ fontSize: 38 }}>{BASS_CLEF}</text>
        {[oy, oy + STAFF.bassTop].map(ty => (
          <g key={ty}>
            <text className="meter" x={74} y={ty + 17}>{piece.beatsPerBar}</text>
            <text className="meter" x={74} y={ty + 37}>4</text>
          </g>
        ))}

        {Array.from({ length: bars }, (_, bar) => {
          const bx = STAFF.pad + bar * STAFF.barWidth;
          return (
            <g key={bar}>
              <text className="barnum" x={bx + 3} y={oy - 5}>{bar + 1}</text>
              <line className="barline" x1={bx} y1={oy} x2={bx} y2={oy + 130} />
            </g>
          );
        })}
        <line className="barline" x1={staffEndX - 8} y1={oy} x2={staffEndX - 8} y2={oy + 130} />
        <line className="barline end" x1={staffEndX - 2} y1={oy} x2={staffEndX - 2} y2={oy + 130} />

        <rect
          className="playhead"
          x={(laid[current]?.x ?? 0) - 15}
          y={oy - 8}
          width={30}
          height={150}
          rx={7}
        />

        {laid.map(l => {
          const half = l.note.duration >= 2;
          const partner = l.beamTo !== null ? laid[l.beamTo] : null;
          const beamedFrom = laid.find(o => o.beamTo === l.index) ?? null;
          const stemX = l.x + (l.stemUp ? 5.8 : -5.8);

          let stemEnd = l.y + (l.stemUp ? -32 : 32);
          if (partner) stemEnd = l.stemUp ? Math.min(l.y, partner.y) - 32 : Math.max(l.y, partner.y) + 32;
          else if (beamedFrom) stemEnd = l.stemUp ? Math.min(l.y, beamedFrom.y) - 32 : Math.max(l.y, beamedFrom.y) + 32;

          return (
            <g
              key={l.index}
              className={[
                'sn',
                l.note.hand,
                half ? 'half' : '',
                l.index === current ? 'cur' : '',
                played[l.index] && l.index !== current ? 'done' : '',
              ].filter(Boolean).join(' ')}
            >
              {l.ledgers.map(y => (
                <line key={y} className="ledger" x1={l.x - 10} y1={y} x2={l.x + 10} y2={y} />
              ))}
              {partner && (
                <line className="beam" x1={stemX} y1={stemEnd} x2={partner.x + (l.stemUp ? 5.8 : -5.8)} y2={stemEnd} />
              )}
              {!partner && !beamedFrom && l.note.duration === 0.5 && (
                <path className="flag" d={`M${stemX} ${stemEnd}q9 6 8 17`} />
              )}
              <line className="stem" x1={stemX} y1={l.y} x2={stemX} y2={stemEnd} />
              <ellipse
                className="head"
                cx={l.x}
                cy={l.y}
                rx={6.4}
                ry={4.9}
                transform={`rotate(-18 ${l.x} ${l.y})`}
              />
              <text className="nl" x={l.x} y={l.y}>{letterOf(l.note.pitch)}</text>
              <circle className="ring" cx={l.x} cy={l.y} r={12} />
              {/* hollow heads have no fill, so every note needs a real hit target */}
              <circle className="hit" cx={l.x} cy={l.y} r={16} onClick={() => onSelect(l.index)} />
              <text className="lyric" x={l.x} y={oy + STAFF.lyricY}>{l.note.lyric}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
