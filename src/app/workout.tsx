import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell, KgTag } from '@/components/Bell';
import { ExerciseDemo, ExerciseHowToSheet } from '@/components/ExerciseDemo';
import { Icon } from '@/components/Icon';
import { findExercise } from '@/data/exercises';
import { exerciseName, getWorkout, itemForMinute, kgFor, repsFor, repsLabel } from '@/data/workouts';
import { IconButton, Row, Screen } from '@/components/ui';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

type Credit = { reps: number; kg: number };

const clock = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, '0')}`;

export default function Workout() {
  const params = useLocalSearchParams<{ id?: string; kg?: string }>();
  /** The one bell weight used for the whole workout. */
  const bell = Number(params.kg ?? 0);
  const plan = getWorkout(params.id ?? '');
  const amrap = plan?.format === 'amrap';
  const total = plan?.minutes ?? 0;

  // EMOM: one exercise per minute. AMRAP: work through the list again and again until time is up.
  const [minute, setMinute] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [paused, setPaused] = useState(false);
  const [credits, setCredits] = useState<Record<number, Credit>>({});
  const [done, setDone] = useState<Credit[]>([]);
  const [howTo, setHowTo] = useState(false);
  const elapsed = useRef(0);
  const [tick, setTick] = useState(0);

  const current = plan ? (amrap ? plan.items[index] : itemForMinute(plan, minute)) : undefined;
  const next = plan ? (amrap ? plan.items[(index + 1) % plan.items.length] : itemForMinute(plan, minute + 1)) : undefined;
  const currentEx = current ? findExercise(current.exerciseId) : undefined;
  const currentKg = current ? bell : 0;
  const nextKg = next ? bell : 0;

  const moved = amrap ? done.reduce((a, c) => a + c.kg, 0) : Object.values(credits).reduce((a, c) => a + c.kg, 0);
  const reps = amrap ? done.reduce((a, c) => a + c.reps, 0) : Object.values(credits).reduce((a, c) => a + c.reps, 0);
  const doneThisMinute = !amrap && !!credits[minute];
  const timeLeft = amrap ? total * 60 - elapsed.current : secondsLeft;

  const finish = (result?: { reps: number; kg: number; rounds: number }) => {
    const totals = result ?? {
      reps,
      kg: moved,
      rounds: amrap ? round - 1 : Object.keys(credits).length,
    };
    router.replace({
      pathname: '/summary',
      params: {
        name: plan?.name ?? 'Workout',
        format: plan?.format ?? 'emom',
        bell: String(bell),
        minutes: String(total),
        rounds: String(totals.rounds),
        reps: String(totals.reps),
        kg: String(totals.kg),
        seconds: String(elapsed.current),
      },
    });
  };

  // One tick a second: EMOM counts the minute down, AMRAP counts up to the time cap.
  useEffect(() => {
    if (paused || !plan) return;
    const t = setInterval(() => {
      elapsed.current += 1;
      if (amrap) setTick((n) => n + 1);
      else setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [paused, plan, amrap]);

  // AMRAP: stop when the time cap is reached.
  useEffect(() => {
    if (!amrap || !plan || paused) return;
    if (elapsed.current >= total * 60) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // EMOM: the minute ran out.
  useEffect(() => {
    if (amrap || secondsLeft > 0) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    // No Done tap: assume the set was done and log it, so the bar fills in.
    const updated = credits[minute] || !current ? credits : { ...credits, [minute]: { reps: repsFor(current), kg: kgFor(current, bell) } };
    if (updated !== credits) setCredits(updated);
    if (minute >= total) {
      finish({
        reps: Object.values(updated).reduce((a, c) => a + c.reps, 0),
        kg: Object.values(updated).reduce((a, c) => a + c.kg, 0),
        rounds: Object.keys(updated).length,
      });
      return;
    }
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  /** EMOM only: move on to the next minute's exercise. */
  const advance = () => {
    if (minute >= total) {
      finish();
      return;
    }
    setMinute((m) => m + 1);
    setSecondsLeft(60);
  };

  const onMainPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (!plan || !current) return;

    if (amrap) {
      // Log the set and step to the next exercise, starting a new round after the last one.
      setDone((list) => [...list, { reps: repsFor(current), kg: kgFor(current, bell) }]);
      if (index >= plan.items.length - 1) {
        setIndex(0);
        setRound((r) => r + 1);
      } else {
        setIndex((i) => i + 1);
      }
      return;
    }

    if (doneThisMinute) {
      // Skip the rest of this minute and start the next exercise now.
      advance();
      return;
    }
    const updated = { ...credits, [minute]: { reps: repsFor(current), kg: kgFor(current, bell) } };
    setCredits(updated);
    if (minute >= total) {
      finish({
        reps: Object.values(updated).reduce((a, c) => a + c.reps, 0),
        kg: Object.values(updated).reduce((a, c) => a + c.kg, 0),
        rounds: Object.keys(updated).length,
      });
    }
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

  const mainLabel = amrap
    ? `Done · next ${next ? exerciseName(next.exerciseId).toLowerCase() : ''}`
    : doneThisMinute
      ? minute >= total
        ? 'Finish workout'
        : `Next: ${next ? exerciseName(next.exerciseId) : ''}`
      : 'Done';

  return (
    <Screen scroll={false}>
      <Row style={{ justifyContent: 'space-between', paddingTop: 4 }}>
        <IconButton icon="close" label="End workout" onPress={() => finish()} />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={styles.header} numberOfLines={1}>
            {plan.name}
          </Text>
          <Text style={styles.sub}>
            {amrap
              ? `Round ${round} · ${index + 1}/${plan.items.length} · ${reps} reps`
              : `Minute ${minute} of ${total}`}
            {' · '}
            {moved.toLocaleString('en-US')} kg
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </Row>

      {amrap ? (
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.min(100, (elapsed.current / (total * 60)) * 100)}%` }]} />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: total }, (_, i) => i + 1).map((m) => (
            <View
              key={m}
              style={[styles.seg, { backgroundColor: credits[m] ? colors.go : m === minute ? colors.text : colors.surface2 }]}
            />
          ))}
        </View>
      )}

      <Row style={{ justifyContent: 'center', alignItems: 'baseline', gap: 12 }}>
        <Text style={styles.timer} accessibilityLabel={`${timeLeft} seconds left`}>
          {clock(timeLeft)}
        </Text>
        <Text style={[styles.sub, { flexShrink: 1 }]}>
          {paused ? 'Paused' : amrap ? 'left · keep going' : doneThisMinute ? 'Resting' : 'left this minute'}
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
              {currentKg ? ` · ${current?.twoBells ? '2 × ' : ''}${currentKg} kg` : ''}
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
          style={({ pressed }) => [styles.done, !amrap && doneThisMinute && styles.nextButton, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.doneLabel, !amrap && doneThisMinute && { color: colors.text }]}
          >
            {mainLabel}
          </Text>
          {!amrap && doneThisMinute ? <Text style={styles.doneHint}>Logged · or rest and it starts at 0:00</Text> : null}
        </Pressable>
        <Pressable accessibilityRole="button" onPress={togglePause} style={({ pressed }) => [styles.done, styles.pause, { opacity: pressed ? 0.85 : 1 }]}>
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
    track: { height: 6, borderRadius: 3, backgroundColor: colors.surface2, overflow: 'hidden' },
    trackFill: { height: 6, borderRadius: 3, backgroundColor: colors.go },
    timer: { fontFamily: fonts.display, fontSize: 88, lineHeight: 92, color: colors.text, fontVariant: ['tabular-nums'] },
    current: { backgroundColor: colors.surface, borderRadius: 20, padding: 12, gap: 12, borderWidth: 2 },
    howBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.surface2 },
    howLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.goText },
    exercise: { fontFamily: fonts.display, fontSize: 26, lineHeight: 28, color: colors.text, textTransform: 'uppercase' },
    reps: { fontFamily: fonts.mono, fontSize: 15, color: colors.text },
    next: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, flex: 1 },
    done: { height: 78, borderRadius: 20, backgroundColor: colors.go, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
    pause: { backgroundColor: colors.warn },
    nextButton: { backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.go },
    doneLabel: { fontFamily: fonts.display, fontSize: 30, color: colors.onGo, textTransform: 'uppercase' },
    doneHint: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, marginTop: 2 },
  }),
);
