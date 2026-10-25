import { useState } from 'react';

/**
 * Blinky: a chubby, fuzzy, pear-shaped 3D furball, not a bald bean.
 * viewBox 0 0 200 175, procedural fur edge (feTurbulence displacement),
 * huge glossy eyes (sclera r18.5, iris r16, two catchlights), soft stubby
 * side arms, no legs, resting on a floor shadow. Happy lavender-violet
 * fur by default; warm tangerine fur with worried brows and a pout
 * in the luteal state. Tap to squish.
 */
export default function BlinkySvg({ mood = 'happy' }: { mood?: 'happy' | 'sad' }) {
  const [squish, setSquish] = useState(false);
  const sad = mood === 'sad';
  const tap = () => {
    setSquish(true);
    try { navigator.vibrate?.(15); } catch { /* no haptics */ }
    setTimeout(() => setSquish(false), 450);
  };
  const gradId = sad ? 'blinky-fur-sad' : 'blinky-fur-happy';
  const mid = sad ? '#F97316' : '#A855F7';
  return (
    <button
      type="button" aria-label="Blinky mascot, tap to pet" onClick={tap}
      className={`peri-svg-btn${squish ? ' squish' : ''}`}
      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', width: '100%' }}
    >
      <svg viewBox="0 0 200 175" role="img" aria-label="Blinky mascot" style={{ overflow: 'visible', display: 'block', width: '100%', height: 'auto' }}>
        <defs>
          <radialGradient id="blinky-fur-happy" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="55%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6B21A8" />
          </radialGradient>
          <radialGradient id="blinky-fur-sad" cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="55%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </radialGradient>
          <filter id="furTexture" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {/* floor shadow */}
        <ellipse cx="100" cy="158" rx="48" ry="8" fill="rgba(109,40,217,0.18)" />
        {/* stubby side arms hugging the body */}
        <g filter="url(#furTexture)">
          <ellipse cx="52" cy="108" rx="15" ry="24" fill={mid} transform="rotate(-18 52 108)" />
          <ellipse cx="148" cy="108" rx="15" ry="24" fill={mid} transform="rotate(18 148 108)" />
          {/* pear-shaped furry body */}
          <path
            d="M100 18 C70 18 48 48 48 92 C48 130 70 158 100 158 C130 158 152 130 152 92 C152 48 130 18 100 18 Z"
            fill={`url(#${gradId})`}
          />
        </g>
        {/* soft top highlight */}
        <ellipse cx="76" cy="44" rx="26" ry="13" fill="#fff" opacity="0.28" transform="rotate(-24 76 44)" />
        {/* huge glossy eyes: white sclera ring, black-brown sphere, catchlights */}
        <g className="blinky-eyes">
          <circle cx="78" cy="84" r="18.5" fill="#fff" />
          <circle cx="122" cy="84" r="18.5" fill="#fff" />
          <circle cx="78" cy="84" r="16" fill="#241612" />
          <circle cx="122" cy="84" r="16" fill="#241612" />
          <circle cx="73" cy="79" r="4.5" fill="#fff" />
          <circle cx="117" cy="79" r="4.5" fill="#fff" />
          <circle cx="83" cy="89" r="2" fill="#fff" />
          <circle cx="127" cy="89" r="2" fill="#fff" />
        </g>
        {sad ? (
          <g stroke="#241612" strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M66 64 Q76 59 84 65" />
            <path d="M116 65 Q124 59 134 64" />
            <path d="M94 98 Q100 93 106 98" />
          </g>
        ) : (
          <path d="M94 94 Q100 99 106 94" stroke="#241612" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </button>
  );
}
