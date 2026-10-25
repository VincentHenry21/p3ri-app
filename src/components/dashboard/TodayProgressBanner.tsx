/**
 * Today's progress, reference style: indigo gradient card, a cute
 * light-purple bear with round ears and cheering arms peeking over
 * white fluffy clouds in the bottom-left, 5 thick pill segments on
 * the right (amber filled, translucent lavender remaining), and two
 * dark-indigo translucent pills at the bottom.
 */
function BearPeek() {
  return (
    <svg viewBox="0 0 110 96" aria-hidden="true" style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* cheering arms */}
      <ellipse cx="22" cy="52" rx="9" ry="18" fill="#C4B5FD" transform="rotate(-24 22 52)" />
      <ellipse cx="88" cy="52" rx="9" ry="18" fill="#C4B5FD" transform="rotate(24 88 52)" />
      {/* round ears */}
      <circle cx="30" cy="30" r="13" fill="#C4B5FD" />
      <circle cx="80" cy="30" r="13" fill="#C4B5FD" />
      <circle cx="30" cy="30" r="6" fill="#EDE9FE" />
      <circle cx="80" cy="30" r="6" fill="#EDE9FE" />
      {/* head */}
      <ellipse cx="55" cy="52" rx="30" ry="27" fill="#DDD6FE" />
      <circle cx="45" cy="50" r="3.4" fill="#312E81" />
      <circle cx="65" cy="50" r="3.4" fill="#312E81" />
      <circle cx="46.5" cy="48.5" r="1.2" fill="#fff" />
      <circle cx="66.5" cy="48.5" r="1.2" fill="#fff" />
      <ellipse cx="55" cy="61" rx="4.5" ry="3.2" fill="#312E81" />
      <path d="M50 66 Q55 70 60 66" stroke="#312E81" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="40" cy="60" rx="4.5" ry="3" fill="#F0ABFC" opacity="0.7" />
      <ellipse cx="70" cy="60" rx="4.5" ry="3" fill="#F0ABFC" opacity="0.7" />
      {/* fluffy clouds the bear peeks over */}
      <ellipse cx="28" cy="90" rx="24" ry="10" fill="#fff" />
      <ellipse cx="62" cy="92" rx="26" ry="10" fill="#fff" />
      <ellipse cx="88" cy="88" rx="18" ry="8" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export default function TodayProgressBanner({ done, total, next }: {
  done: number; total: number; next: string;
}) {
  const left = Math.max(0, total - done);
  return (
    <div className="progress-spec">
      <div className="progress-bear" aria-hidden="true"><BearPeek /></div>
      <div className="progress-body">
        <div className="progress-row">
          <b>Today's progress</b>
          <b>{done}/{total}</b>
        </div>
        <div className="progress-segments" aria-label={`${done} of ${total} habits done`}>
          {Array.from({ length: total }, (_, i) => (
            <i key={i} className={i < done ? 'on' : ''} />
          ))}
        </div>
        <div className="progress-pills">
          <span>{left === 0 ? 'All done' : `${left} habit${left === 1 ? '' : 's'} left`}</span>
          <span>{done >= total ? 'See you tomorrow' : `Next: ${next}`}</span>
        </div>
      </div>
    </div>
  );
}
