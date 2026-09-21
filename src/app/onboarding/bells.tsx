import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Icon } from '@/components/Icon';
import { Steps } from '@/components/Steps';
import { BackLink, Body, Button, Screen, tap, Title } from '@/components/ui';
import { BELL_WEIGHTS, useBells } from '@/store/bells';
import { bellColor, colors, fonts } from '@/theme';

export default function Onboarding() {
  const { owned, cycle, rack, onboarded } = useBells();
  const { width } = useWindowDimensions();
  const cellWidth = Math.floor((Math.min(width, 520) - 44 - 20) / 3);
  const pairs = Object.keys(owned).map(Number).filter((kg) => owned[kg] === 2);

  const done = () => {
    // Editing bells later from Today: just go back.
    if (onboarded) {
      router.back();
      return;
    }
    router.push('/onboarding/profile');
  };

  return (
    <Screen
      footer={
        <>
          <Button label={onboarded ? 'Save bells' : 'Continue'} onPress={done} />
          {onboarded ? null : <Button label="I don’t own a kettlebell yet" variant="ghost" height={44} onPress={done} />}
        </>
      }
    >
      {onboarded ? <BackLink label="Back" /> : <BackLink label="Welcome" />}
      {onboarded ? null : <Steps step={2} />}
      <View style={{ gap: 10 }}>
        <Title size={44}>Which bells do you own?</Title>
        <Body muted>Every routine is built for exactly these bells. Tap to add, tap again for a pair.</Body>
      </View>

      <View style={styles.grid}>
        {BELL_WEIGHTS.map((kg) => {
          const count = owned[kg] ?? 0;
          const on = count > 0;
          return (
            <Pressable
              key={kg}
              accessibilityRole="button"
              accessibilityLabel={`${kg} kilogram bell, ${count === 0 ? 'not owned' : count === 1 ? 'one' : 'a pair'}`}
              onPress={() => {
                tap();
                cycle(kg);
              }}
              style={[styles.cell, { width: cellWidth, borderColor: on ? bellColor(kg) : colors.surface2 }]}
            >
              {on ? (
                <View style={[styles.badge, { backgroundColor: bellColor(kg) }]}>
                  <Text style={styles.badgeText}>×{count}</Text>
                </View>
              ) : null}
              <Bell kg={kg} size={34} filled={on} />
              <Text style={[styles.cellLabel, { color: on ? colors.text : colors.muted }]}>{kg} kg</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" style={[styles.cell, styles.other, { width: cellWidth }]}>
          <Text style={styles.otherLabel}>+ Other</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <Icon name="check" size={18} color={colors.go} />
        <Text style={styles.summaryText}>
          {rack.length === 0
            ? 'No bells yet — we’ll start with bodyweight'
            : `${rack.length} bell${rack.length > 1 ? 's' : ''}${pairs.length ? ` · pair of ${pairs.join(' and ')} kg unlocks double-bell work` : ''}`}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    height: 104,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  badgeText: { fontFamily: fonts.monoMedium, fontSize: 12, color: '#111' },
  cellLabel: { fontFamily: fonts.monoMedium, fontSize: 14 },
  other: { borderStyle: 'dashed', borderColor: colors.line, backgroundColor: 'transparent' },
  otherLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, backgroundColor: colors.surface },
  summaryText: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.muted },
});
