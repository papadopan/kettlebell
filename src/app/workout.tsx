import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell, KgTag } from '@/components/Bell';
import { ExerciseDemo, ExerciseHowToSheet } from '@/components/ExerciseDemo';
import { Icon } from '@/components/Icon';
import { findExercise } from '@/data/exercises';
import { IconButton, Row, Screen } from '@/components/ui';
import { exerciseName, getWorkout, itemForMinute, kgFor, loadFor, repsFor, repsLabel } from '@/data/workouts';
import { useBells } from '@/store/bells';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

type Credit = { reps: number; kg: number };

export default function Workout() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { weights } = useBells();
  const plan = getWorkout(params.id ?? '');
  const total = plan?.minutes ?? 0;
  const [minute, setMinute] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [paused, setPaused] = useState(false);
  const [credits, setCredits] = useState<Record<number, Credit>>({});
  const [howTo, setHowTo] = useState(false);
  const elapsed = useRef(0);

  const current = plan ? itemForMinute(plan, minute) : undefined;
  const next = plan ? itemForMinute(plan, minute + 1) : undefined;
  const currentEx = current ? findExercise(current.exerciseId) : undefined;
  const currentKg = current ? loadFor(current.load, weights) : 0;
  const nextKg = next ? loadFor(next.load, weights) : 0;

  const moved = Object.values(credits).reduce((a, c) => a + c.kg, 0);
  const reps = Object.values(credits).reduce((a, c) => a + c.reps, 0);
  const doneThisMinute = !!credits[minute];

  const finish = (c = credits) => {
    const list = Object.values(c);
    router.replace({
      pathname: '/summary',
      params: {
        name: plan?.name ?? 'Workout',
        minutes: String(total),
        rounds: String(list.length),
        reps: String(list.reduce((a, x) => a + x.reps, 0)),
        kg: String(list.reduce((a, x) => a + x.kg, 0)),
        seconds: String(elapsed.current),
      },
    });
  };

  useEffect(() => {
    if (paused || !plan) return;
    const t = setInterval(() => {
      elapsed.current += 1;
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    if (secondsLeft > 0) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  /** Move on to the next minute's exercise, or finish after the last one. */
  const advance = () => {
    if (minute >= total) {
      finish();
      return;
    }
    setMinute((m) => m + 1);
    setSecondsLeft(60);
  };

  const onMainPress = () => {
    if (doneThisMinute) {
      // Skip the rest of this minute and start the next exercise now.
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      advance();
      return;
    }
    markDone();
  };

  const markDone = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (!current) return;
    const updated = { ...credits, [minute]: { reps: repsFor(current), kg: kgFor(current, weights) } };
    setCredits(updated);
    if (minute >= total) finish(updated);
  };

  const togglePause = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPaused((p) => !p);
  };

  if (!plan) {
    return (
      <Screen>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <Text style={styles.header}>Workout not found</Text>
      </Screen>
    );
  }

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Screen scroll={false}>
      <Row style={{ justifyContent: 'space-between', paddingTop: 4 }}>
        <IconButton icon="close" label="End workout" onPress={() => finish()} />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={styles.header}>{plan.name}</Text>
          <Text style={styles.sub}>
            Minute {minute} of {total} · {moved.toLocaleString('en-US')} kg · {reps} reps
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </Row>

      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: total }, (_, i) => i + 1).map((m) => (
          <View
            key={m}
            style={[styles.seg, { backgroundColor: credits[m] ? colors.go : m === minute ? colors.text : colors.surface2 }]}
          />
        ))}
      </View>

      <Row style={{ justifyContent: 'center', alignItems: 'baseline', gap: 12 }}>
        <Text style={styles.timer} accessibilityLabel={`${secondsLeft} seconds left in this minute`}>
          {mm}:{ss}
        </Text>
        <Text style={[styles.sub, { flexShrink: 1 }]}>
          {paused ? 'Paused' : doneThisMinute ? 'Resting' : 'left this minute'}
        </Text>
      </Row>

      <View style={[styles.current, { borderColor: bellColor(currentKg), opacity: doneThisMinute ? 0.6 : 1 }]}>
        <ExerciseDemo images={currentEx?.images ?? []} height={170} showCaption={false} />
        <Row style={{ gap: 12 }}>
          <Bell kg={currentKg} size={36} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.exercise} numberOfLines={2} adjustsFontSizeToFit>
              {current ? exerciseName(current.exerciseId) : ''}
            </Text>
            <Text style={styles.reps}>
              {current ? repsLabel(current).replace(' / side', ' per side') : ''}
              {currentKg ? ` · ${currentKg} kg` : ''}
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setHowTo(true)} style={styles.howBtn} hitSlop={6}>
            <Icon name="library" size={16} color={colors.goText} />
            <Text style={styles.howLabel}>How to</Text>
          </Pressable>
        </Row>
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={styles.next} numberOfLines={1}>
          Next: {next ? exerciseName(next.exerciseId).toLowerCase() : ''} · {next ? repsLabel(next).replace(' / side', ' per side') : ''}
        </Text>
        {nextKg ? <KgTag kg={nextKg} /> : null}
      </Row>

      <ExerciseHowToSheet exercise={currentEx} visible={howTo} onClose={() => setHowTo(false)} />

      <View style={{ marginTop: 'auto', gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          onPress={onMainPress}
          style={({ pressed }) => [
            styles.done,
            doneThisMinute && styles.nextButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.doneLabel, doneThisMinute && { color: colors.text }]}>
            {doneThisMinute ? (minute >= total ? 'Finish workout' : `Next: ${next ? exerciseName(next.exerciseId) : ''}`) : 'Done'}
          </Text>
          {doneThisMinute ? (
            <Text style={styles.doneHint}>Logged · or rest and it starts at 0:00</Text>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={togglePause}
          style={({ pressed }) => [styles.done, styles.pause, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[styles.doneLabel, { color: colors.onWarn }]}>{paused ? 'Resume' : 'Pause'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  header: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text, textTransform: 'uppercase' },
  sub: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  seg: { flex: 1, height: 6, borderRadius: 3 },
  timer: { fontFamily: fonts.display, fontSize: 88, lineHeight: 92, color: colors.text, fontVariant: ['tabular-nums'] },
  current: { backgroundColor: colors.surface, borderRadius: 20, padding: 12, gap: 12, borderWidth: 2 },
  howBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.surface2 },
  howLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.goText },
  exercise: { fontFamily: fonts.display, fontSize: 26, lineHeight: 28, color: colors.text, textTransform: 'uppercase' },
  reps: { fontFamily: fonts.mono, fontSize: 15, color: colors.text },
  next: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  done: { height: 72, borderRadius: 20, backgroundColor: colors.go, alignItems: 'center', justifyContent: 'center' },
  doneLabel: { fontFamily: fonts.display, fontSize: 30, color: colors.onGo, textTransform: 'uppercase' },
  pause: { backgroundColor: colors.warn },
  nextButton: { backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.go },
  doneHint: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, marginTop: 2 },
}),
);
