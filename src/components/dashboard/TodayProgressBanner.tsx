import PeriSvg from '../mascot/PeriSvg';

/**
 * Indigo gradient progress card: a cute peeking Peri on the left,
 * 4 segmented amber pills on the right showing habit progress.
 */
export default function TodayProgressBanner({ done, total, next, style }: {
  done: number; total: number; next: string; style: 'plush' | 'jelly';
}) {
  const filled = total > 0 ? Math.round((done / total) * 4) : 0;
  return (
    <div className="card progress-gradient">
      <div className="peek" aria-hidden="true"><PeriSvg style={style} small /></div>
      <div className="progress-body">
        <b>Today's Progress</b>
        <p>{done}/{total} completed</p>
        <div className="segments" aria-label={`${done} of ${total} habits done`}>
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={i < filled ? 'on' : ''} />
          ))}
        </div>
        <p className="status" style={{ color: 'rgba(255,255,255,0.85)' }}>{done >= total ? 'All habits done, lovely.' : `Next: ${next}`}</p>
      </div>
    </div>
  );
}
