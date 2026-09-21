import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, space, themedStyles } from '@/theme';
import { Icon, IconName } from './Icon';

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

type ScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  /** Tab screens sit above the tab bar, so they skip the bottom safe area. */
  inTabs?: boolean;
  scroll?: boolean;
};

export function Screen({ children, footer, inTabs = false, scroll = true }: ScreenProps) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.screen} edges={inTabs ? ['top'] : ['top', 'bottom']}>
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Eyebrow({ children, color = colors.muted }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function Title({ children, size = 40, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[styles.title, { fontSize: size, lineHeight: size * 0.98 }, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, muted && { color: colors.muted }, style]}>{children}</Text>;
}

export function Mono({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.mono, style]}>{children}</Text>;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  height?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function Button({ label, onPress, variant = 'primary', height = 56, style, labelStyle }: ButtonProps) {
  const bg = variant === 'primary' ? colors.go : variant === 'secondary' ? colors.surface2 : 'transparent';
  const fg = variant === 'primary' ? colors.onGo : variant === 'secondary' ? colors.text : colors.muted;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.button, { backgroundColor: bg, height, opacity: pressed ? 0.8 : 1 }, style]}
    >
      <Text style={[styles.buttonLabel, { color: fg }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, color = colors.go }: { label: string; selected?: boolean; onPress?: () => void; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[styles.chip, selected ? { borderColor: color, backgroundColor: colors.surface2 } : null]}
    >
      <Text style={[styles.chipLabel, selected ? { color: colors.text, fontFamily: fonts.bodySemi } : null]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ProgressBar({ value, color = colors.go }: { value: number; color?: string }) {
  const pct = `${Math.max(0, Math.min(1, value)) * 100}%` as const;
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={[styles.fill, { width: pct, backgroundColor: color }]} />
    </View>
  );
}

export function BackLink({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress ?? (() => router.back())} style={styles.back} hitSlop={8}>
      <Icon name="back" size={18} color={colors.muted} />
      <Text style={styles.backLabel}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon name={icon} />
    </Pressable>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, style]}>{children}</View>;
}

const styles = themedStyles(() =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.gutter, paddingTop: 12, paddingBottom: 24, gap: 18 },
  footer: { paddingHorizontal: space.gutter, paddingTop: 8, paddingBottom: 12, gap: 8 },
  eyebrow: { fontFamily: fonts.monoMedium, fontSize: 11, letterSpacing: 0.9, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, color: colors.text, textTransform: 'uppercase' },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.text },
  mono: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  button: { flexGrow: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  buttonLabel: { fontFamily: fonts.bodySemi, fontSize: 16 },
  chip: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, alignSelf: 'flex-start' },
  backLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  iconButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
}),
);
