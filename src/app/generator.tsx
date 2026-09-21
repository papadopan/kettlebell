import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { BackLink, Button, Chip, Eyebrow, Screen, Title } from '@/components/ui';
import { defaultBell, generateWorkout, Goal, Group, GROUPS } from '@/data/workouts';
import { useBells } from '@/store/bells';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

const TIMES = [10, 16, 20, 30];
const GOALS: { id: Goal; hint: string }[] = [
  { id: 'Strength', hint: 'Heavier bells, fewer reps, more rest' },
  { id: 'Conditioning', hint: 'Lighter bells, more reps, less rest' },
  { id: 'Mobility', hint: 'Light bells, slow and controlled' },
];

export default function Generator() {
  const params = useLocalSearchParams<{ group?: Group }>();
  const { owned, weights, level } = useBells();
  const [group, setGroup] = useState<Group>(params.group ?? 'full');
  const [minutes, setMinutes] = useState(20);
  const [goal, setGoal] = useState<Goal>('Strength');
  const [bell, setBell] = useState<number | undefined>(() => defaultBell(weights, level));
  const [pair, setPair] = useState(false);
  const canPair = bell !== undefined && (owned[bell] ?? 0) >= 2;

  const build = () => {
    const w = generateWorkout({ group, minutes, goal, pair: pair && canPair });
    router.push({ pathname: '/routine', params: bell ? { id: w.id, kg: String(bell) } : { id: w.id } });
  };

  return (
    <Screen footer={<Button label="Build workout" onPress={build} />}>
      <BackLink label="Back" />
      <Title size={44}>Build your own</Title>

      <View style={styles.section}>
        <Eyebrow>Body part</Eyebrow>
        <View style={styles.wrap}>
          {GROUPS.map((g) => (
            <Chip key={g.id} label={g.label} selected={group === g.id} onPress={() => setGroup(g.id)} />
          ))}
        </View>
      </View>

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
        <Text style={styles.hint}>{GOALS.find((g) => g.id === goal)?.hint}</Text>
      </View>

      <View style={styles.section}>
        <Eyebrow>Bell for this workout</Eyebrow>
        <View style={styles.wrap}>
          {weights.map((kg) => {
            const on = kg === bell;
            return (
              <Pressable
                key={kg}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setBell(kg)}
                style={[styles.bell, { borderColor: on ? bellColor(kg) : colors.surface2 }]}
              >
                <Bell kg={kg} size={26} filled={on} />
                <Text style={styles.bellLabel}>
                  {kg}
                  {(owned[kg] ?? 0) >= 2 ? ' ×2' : ''}
                </Text>
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" accessibilityLabel="Edit my bells" onPress={() => router.push('/onboarding/bells')} style={styles.addBell}>
            <Text style={styles.addLabel}>+</Text>
          </Pressable>
        </View>
        {canPair ? (
          <View style={styles.wrap}>
            <Chip label="One bell" selected={!pair} onPress={() => setPair(false)} />
            <Chip label={`Pair of ${bell} kg`} selected={pair} onPress={() => setPair(true)} />
          </View>
        ) : null}
        <Text style={styles.hint}>The whole workout uses this weight. Go heavier as it gets easier.</Text>
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    section: { gap: 10 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hint: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
    bell: { width: 64, height: 76, borderRadius: 14, borderWidth: 2, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 4 },
    bellLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.text },
    addBell: { width: 44, height: 76, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
    addLabel: { fontSize: 20, color: colors.muted },
  }),
);
