import type { ExpressionContext } from '../../lib/periExpressions';
import BlinkySvg from './BlinkySvg';
import CycleArcGauge from './CycleArcGauge';

/**
 * One hero stage: the floating white speech bubble above Blinky's head,
 * Blinky inside the center of the 180-degree arc, all unclipped
 * (overflow visible, 16/11 aspect, max-width 310px). No feeling line,
 * no drag hint, no clutter below the stage.
 */
export default function HeroStage({ speech, context, day, cycleLength, color, onScrub }: {
  speech: string;
  context: ExpressionContext;
  day: number;
  cycleLength: number;
  color: string;
  onScrub?: (day: number) => void;
}) {
  return (
    <div className="hero-stage">
      <div className="hero-bubble">{speech}</div>
      <div className="hero-mascot">
        <BlinkySvg mood={context.phase === 'luteal' ? 'sad' : 'happy'} />
      </div>
      <div className="hero-arc">
        <CycleArcGauge day={day} cycleLength={cycleLength} color={color} onScrub={onScrub} />
      </div>
    </div>
  );
}
