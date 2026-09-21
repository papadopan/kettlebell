import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { bellColor, colors, fonts, themedStyles } from '@/theme';

type Props = {
  kg?: number;
  color?: string;
  size?: number;
  filled?: boolean;
};

/** A kettlebell drawn in its competition colour. */
export function Bell({ kg, color, size = 36, filled = true }: Props) {
  const c = color ?? (kg ? bellColor(kg) : colors.dim);
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 40 44">
      <Path d="M12 17 V11 a8 8 0 0 1 16 0 V17" fill="none" stroke={c} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={20} cy={29} r={13} fill={filled ? c : 'none'} stroke={c} strokeWidth={3} />
    </Svg>
  );
}

/** Small coloured dot + weight, e.g. "● 20 kg". */
export function KgTag({ kg }: { kg: number }) {
  return (
    <View style={styles.tag}>
      <View style={[styles.dot, { backgroundColor: bellColor(kg) }]} />
      <Text style={styles.tagText}>{kg} kg</Text>
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tagText: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
}),
);
