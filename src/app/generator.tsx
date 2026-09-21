import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { BackLink, Button, Chip, Eyebrow, Screen, Title } from '@/components/ui';
import { useBells } from '@/store/bells';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

const TIMES = [10, 20, 30, 45];
const GOALS = [
  { id: 'Strength', hint: 'Heavier bells, fewer reps, longer rest' },
  { id: 'Conditioning', hint: 'Lighter bells, more reps, short rest' },
  { id: 'Mobility', hint: 'Halos, windmills and get-ups at an easy pace' },
];
const FORMATS = ['Auto', 'EMOM', 'Ladder', 'Complex'];

export default function Generator() {
  const { rack } = useBells();
  const [minutes, setMinutes] = useState(20);
  const [goal, setGoal] = useState('Strength');
  const [format, setFormat] = useState('Auto');
  const [unlockedOnly, setUnlockedOnly] = useState(true);

  return (
    <Screen
      footer={
        <Button
          label="Generate routine"
          onPress={() => router.push({ pathname: '/routine', params: { minutes: String(minutes), goal } })}
        />
      }
    >
      <BackLink label="Today" />
      <Title size={44}>New routine</Title>

      <View style={styles.section}>
        <Eyebrow>Time</Eyebrow>
        <View style={styles.wrap}>
          {TIMES.map((t) => (
            <Chip key={t} label={`${t} min`} selected={minutes === t} onPress={() => setMinutes(t)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Eyebrow>Goal</Eyebrow>
        <View style={styles.wrap}>
          {GOALS.map((g) => (
            <Chip key={g.id} label={g.id} selected={goal === g.id} onPress={() => setGoal(g.id)} />
          ))}
        </View>
        <Text style={styles.goalHint}>{GOALS.find((g) => g.id === goal)?.hint}</Text>
      </View>

      <View style={styles.section}>
        <Eyebrow>Bells</Eyebrow>
        <View style={styles.wrap}>
          {rack.map((kg, i) => (
            <View key={`${kg}-${i}`} style={[styles.bell, { borderColor: bellColor(kg) }]}>
              <Bell kg={kg} size={26} />
              <Text style={styles.bellLabel}>{kg}</Text>
            </View>
          ))}
          <Pressable accessibilityRole="button" accessibilityLabel="Edit my bells" onPress={() => router.push('/onboarding/bells')} style={styles.addBell}>
            <Text style={styles.addLabel}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Eyebrow>Format</Eyebrow>
        <View style={styles.wrap}>
          {FORMATS.map((f) => (
            <Chip key={f} label={f} selected={format === f} onPress={() => setFormat(f)} />
          ))}
        </View>
      </View>

      <View style={styles.toggle}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.toggleTitle}>Only skills I’ve unlocked</Text>
          <Text style={styles.goalHint}>Plus practice for your current Bell Path step</Text>
        </View>
        <Switch
          value={unlockedOnly}
          onValueChange={setUnlockedOnly}
          trackColor={{ true: colors.go, false: colors.surface2 }}
          thumbColor={colors.text}
          accessibilityLabel="Only skills I’ve unlocked"
        />
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  section: { gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalHint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  bell: { width: 64, height: 76, borderRadius: 14, borderWidth: 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bellLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.text },
  addBell: { width: 44, height: 76, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  addLabel: { fontSize: 20, color: colors.muted },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: colors.surface },
  toggleTitle: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
}),
);
