import { selectExpression, type ExpressionContext } from '../../lib/periExpressions';
import PeriSvg from './PeriSvg';

/**
 * Peri as a custom 3D SVG buddy. No system emojis, no expression gallery,
 * no developer text. The speech bubble lives in the hero stage above.
 */
export default function PeriMascot3D({ style, context }: {
  style: 'plush' | 'jelly';
  speech?: string;
  context: ExpressionContext;
}) {
  const expression = selectExpression(context);
  return (
    <div style={{ textAlign: 'center' }}>
      <PeriSvg style={style} phase={context.phase} />
      <p className="status">Peri is feeling: <b>{expression.label}</b></p>
    </div>
  );
}
