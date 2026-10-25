import { selectExpression, type ExpressionContext } from '../../lib/periExpressions';
import PeriSvg from './PeriSvg';
import JellySticker, { type StickerId } from './JellyStickers';
import CycleArcGauge from './CycleArcGauge';

/** Current Peri expression rendered as its jelly-cloud sticker badge. */
const STICKER_FOR_EXPRESSION: Record<string, StickerId> = {
  starry: 'starry', cookie: 'cookie', wink: 'wink', dizzy: 'dizzy',
  sleeping: 'sleepy', sparkle: 'sparkle', book: 'reader', melting: 'puddle',
  heart: 'loved', plush: 'loved', calm: 'calm', low: 'sensitive',
};

/**
 * One hero stage: the floating white speech bubble above Peri's head,
 * Peri inside the center of the 180-degree arc, all unclipped
 * (overflow visible, 16/11 aspect, max-width 310px).
 */
export default function HeroStage({ style, speech, context, day, cycleLength, color, onScrub }: {
  style: 'plush' | 'jelly';
  speech: string;
  context: ExpressionContext;
  day: number;
  cycleLength: number;
  color: string;
  onScrub?: (day: number) => void;
}) {
  const expression = selectExpression(context);
  return (
    <div>
      <div className="hero-stage">
        <div className="hero-bubble">{speech}</div>
        <div className="hero-mascot">
          <PeriSvg style={style} phase={context.phase} />
        </div>
        <div className="hero-arc">
          <CycleArcGauge day={day} cycleLength={cycleLength} color={color} onScrub={onScrub} />
        </div>
      </div>
      <div className="hero-expression">
        <JellySticker id={STICKER_FOR_EXPRESSION[expression.id] ?? 'calm'} size={48} />
        <p className="status">Peri is feeling: <b>{expression.label}</b></p>
      </div>
    </div>
  );
}
