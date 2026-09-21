import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';

export type IconName =
  | 'back'
  | 'chevron'
  | 'share'
  | 'pause'
  | 'play'
  | 'close'
  | 'settings'
  | 'check'
  | 'lock'
  | 'today'
  | 'path'
  | 'library'
  | 'log';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 20, color = colors.text, strokeWidth = 2 }: Props) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'back' && <Path d="M15 18l-6-6 6-6" {...p} />}
      {name === 'chevron' && <Path d="M9 18l6-6-6-6" {...p} />}
      {name === 'share' && (
        <>
          <Path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" {...p} />
          <Path d="M12 3v12" {...p} />
          <Path d="M7 8l5-5 5 5" {...p} />
        </>
      )}
      {name === 'pause' && (
        <>
          <Path d="M9 5v14" {...p} />
          <Path d="M15 5v14" {...p} />
        </>
      )}
      {name === 'play' && <Path d="M7 5l12 7-12 7z" {...p} />}
      {name === 'close' && (
        <>
          <Path d="M6 6l12 12" {...p} />
          <Path d="M18 6L6 18" {...p} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...p} />
          <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...p} />
        </>
      )}
      {name === 'check' && <Path d="M20 6L9 17l-5-5" {...p} />}
      {name === 'lock' && (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={2} {...p} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...p} />
        </>
      )}
      {name === 'today' && (
        <>
          <Path d="M3 11l9-7 9 7" {...p} />
          <Path d="M5 10v10h14V10" {...p} />
        </>
      )}
      {name === 'path' && (
        <>
          <Circle cx={6} cy={6} r={2.5} {...p} />
          <Circle cx={18} cy={12} r={2.5} {...p} />
          <Circle cx={6} cy={18} r={2.5} {...p} />
          <Path d="M8.3 7.2l7.4 3.6M15.7 13.2l-7.4 3.6" {...p} />
        </>
      )}
      {name === 'library' && (
        <>
          <Path d="M4 5h6v14H4z" {...p} />
          <Path d="M14 5h6v14h-6z" {...p} />
        </>
      )}
      {name === 'log' && (
        <>
          <Path d="M4 20V10" {...p} />
          <Path d="M10 20V4" {...p} />
          <Path d="M16 20v-7" {...p} />
          <Path d="M22 20H2" {...p} />
        </>
      )}
    </Svg>
  );
}
