import { selectExpression, type ExpressionContext } from '../../lib/periExpressions';
import PeriSvg from './PeriSvg';
import CycleArcGauge from './CycleArcGauge';

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
      <p className="status" style={{ textAlign: 'center' }}>Peri is feeling: <b>{expression.label}</b></p>
    </div>
  );
}
