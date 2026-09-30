import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell, KgTag } from '@/components/Bell';
import { ExerciseDemo, ExerciseHowToSheet } from '@/components/ExerciseDemo';
import { Icon } from '@/components/Icon';
import { findExercise } from '@/data/exercises';
import {
  clockMode, exerciseName, getWorkout, kgFor, repsFor, repsLabel, slotAt, slotCount,
} from '@/data/workouts';
import { IconButton, Row, Screen } from '@/components/ui';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

type Credit = { reps: number; kg: number };

const clock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * One player for every format. The workout is a run of slots (see the slot engine in
 * data/workouts.ts); this screen only has to know what the clock does:
 *
 *   slot — each slot gets its own countdown, and running out moves you on (EMOM, intervals, ladder)
 *   cap  — one countdown for the whole session, you move yourself on (AMRAP)
 *   up   — counts up from zero until the work is done (For time)
 *   none — no clock on the work at all, only a rest timer between sets (Straight sets)
 */
export default function Workout() {
  const params = useLocalSearchParams<{ id?: string; kg?: string }>();
  /** The one bell weight used for the whole workout. */
  const bell = Number(params.kg ?? 0);
  const plan = getWorkout(params.id ?? '');
  const mode = plan ? clockMode(plan.format) : 'slot';
  const count = plan ? slotCount(plan) : 0;
  const capSeconds = (plan?.minutes ?? 0) * 60;

  const [n, setN] = useState(0);
  const [slotLeft, setSlotLeft] = useState(() => (plan ? (slotAt(plan, 0).seconds ?? 0) : 0));
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [logged, setLogged] = useState<Credit[]>([]);
  const [creditedSlot, setCreditedSlot] = useState<number | null>(null);
  const [howTo, setHowTo] = useState(false);
  const elapsed = useRef(0);
  const over = useRef(false);
  const [, setTick] = useState(0);

  const slot = plan ? slotAt(plan, n) : undefined;
  const nextSlot = plan && (count === undefined || n + 1 < count) ? slotAt(plan, n + 1) : undefined;
  const currentEx = slot ? findExercise(slot.item.exerciseId) : undefined;
  const last = count !== undefined && n >= count - 1;

  const moved = logged.reduce((a, c) => a + c.kg, 0);
  const reps = logged.reduce((a, c) => a + c.reps, 0);
  const creditedNow = creditedSlot === n;

  const finish = (extra: Credit[] = []) => {
    if (over.current) return;
    over.current = true;
    const all = [...logged, ...extra];
    const perRound = plan?.items.length || 1;
    // "Rounds" means whole trips through the list where that is the point, and
    // completed sets where it is not (EMOM minutes, ladder rungs, straight sets).
    const cycles = plan && (plan.format === 'amrap' || plan.format === 'fortime' || plan.format === 'intervals');
    router.replace({
      pathname: '/summary',
      params: {
        id: plan?.id ?? '',
        name: plan?.name ?? 'Workout',
        format: plan?.format ?? 'emom',
        bell: String(bell),
        minutes: String(plan?.minutes ?? 0),
        rounds: String(cycles ? Math.floor(all.length / perRound) : all.length),
        target: String(count ?? 0),
        sets: String(all.length),
        reps: String(all.reduce((a, c) => a + c.reps, 0)),
        kg: String(all.reduce((a, c) => a + c.kg, 0)),
        seconds: String(elapsed.current),
      },
    });
  };

  const buzz = (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(type).catch(() => {});
  };

  /** Move to the next slot, or finish if that was the last one. */
  const goTo = (next: number, extra: Credit[] = []) => {
    if (!plan) return;
    if (count !== undefined && next >= count) {
      buzz(Haptics.NotificationFeedbackType.Success);
      finish(extra);
      return;
    }
    setN(next);
    setSlotLeft(slotAt(plan, next).seconds ?? 0);
    setResting(false);
    setRestLeft(0);
  };

  /** Log this slot's work, then rest if the format rests, otherwise move straight on. */
  const completeSlot = (credit: Credit | null) => {
    if (!plan || !slot) return;
    const extra = credit ? [credit] : [];
    if (credit) setLogged((list) => [...list, credit]);
    const rest = slot.restAfter ?? 0;
    const lastSlot = count !== undefined && n >= count - 1;
    if (rest > 0 && !lastSlot) {
      setResting(true);
      setRestLeft(rest);
      return;
    }
    goTo(n + 1, extra);
  };

  const creditFor = () => (slot ? { reps: repsFor(slot.item, slot.reps), kg: kgFor(slot.item, bell, slot.reps) } : null);

  // One tick a second. Everything that counts is driven from here.
  useEffect(() => {
    if (paused || !plan || over.current) return;
    const t = setInterval(() => {
      elapsed.current += 1;
      setTick((x) => x + 1);
      if (resting) setRestLeft((s) => s - 1);
      else if (mode === 'slot') setSlotLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [paused, plan, resting, mode]);

  // The rest between sets ran out: on to the next one.
  useEffect(() => {
    if (!resting || restLeft > 0) return;
    buzz(Haptics.NotificationFeedbackType.Warning);
    goTo(n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restLeft, resting]);

  // A timed slot ran out. If you never tapped Done we assume you did the work and log it.
  useEffect(() => {
    if (mode !== 'slot' || resting || slotLeft > 0 || !plan || !slot) return;
    buzz(Haptics.NotificationFeedbackType.Warning);
    completeSlot(creditedNow ? null : creditFor());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotLeft]);

  // AMRAP: stop at the time cap.
  useEffect(() => {
    if (mode !== 'cap' || !plan || paused || over.current) return;
    if (elapsed.current >= capSeconds) {
      buzz(Haptics.NotificationFeedbackType.Success);
      finish();
    }
  });

  const onMainPress = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (!plan || !slot) return;

    if (resting) {
      // Skip the rest of the rest.
      goTo(n + 1);
      return;
    }

    if (mode === 'slot') {
      if (creditedNow) {
        // Already logged — skip the rest of the clock and start the next one now.
        completeSlot(null);
        return;
      }
      setCreditedSlot(n);
      const credit = creditFor();
      if (credit) setLogged((list) => [...list, credit]);
      if (last) {
        buzz(Haptics.NotificationFeedbackType.Success);
        finish(credit ? [credit] : []);
      }
      return;
    }

    // Untimed work (AMRAP, For time, Straight sets): Done both logs and advances.
    completeSlot(creditFor());
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

  const timeShown = resting ? restLeft : mode === 'cap' ? capSeconds - elapsed.current : mode === 'up' || mode === 'none' ? elapsed.current : slotLeft;
  const timeNote = paused
    ? 'Paused'
    : resting
      ? 'rest · next set coming'
      : mode === 'cap'
        ? 'left · keep going'
        : mode === 'up'
          ? 'elapsed · go'
          : mode === 'none'
            ? 'elapsed'
            : creditedNow
              ? 'Resting'
              : plan.format === 'intervals'
                ? 'left · work'
                : 'left this minute';

  const stepped = resting || (mode === 'slot' && creditedNow);
  const mainLabel = resting
    ? 'Skip rest'
    : last
      ? 'Finish workout'
      : mode === 'slot' && creditedNow
        ? 'Next exercise'
        : 'Done';
  const mainHint =
    mode !== 'slot' || !creditedNow || resting
      ? null
      : plan.format === 'intervals'
        ? 'Logged · the rest starts when the clock runs out'
        : 'Logged · or rest and the next minute starts at 0:00';

  const progress = count === undefined ? Math.min(1, elapsed.current / capSeconds) : (n + (creditedNow ? 1 : 0)) / count;

  return (
    <Screen scroll={false}>
      <Row style={{ justifyContent: 'space-between', paddingTop: 4 }}>
        <IconButton icon="close" label="End workout" onPress={() => finish()} />
        <View style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 8 }}>
          <Text style={styles.header} numberOfLines={1}>
            {plan.name}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {slot?.label} · {moved.toLocaleString('en-US')} kg
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </Row>

      {count !== undefined && count <= 32 ? (
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {Array.from({ length: count }, (_, i) => i).map((i) => (
            <View
              key={i}
              style={[styles.seg, { backgroundColor: i < n || (i === n && creditedNow) ? colors.go : i === n ? colors.text : colors.surface2 }]}
            />
          ))}
        </View>
      ) : (
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
      )}

      <Row style={{ justifyContent: 'center', alignItems: 'baseline', gap: 12 }}>
        <Text style={[styles.timer, resting && { color: colors.warn }]} accessibilityLabel={`${Math.max(0, timeShown)} seconds`}>
          {clock(timeShown)}
        </Text>
        <Text style={[styles.sub, { flexShrink: 1 }]}>{timeNote}</Text>
      </Row>

      <View style={[styles.current, { borderColor: resting ? colors.warn : bellColor(bell), opacity: creditedNow && !resting ? 0.6 : 1 }]}>
        <ExerciseDemo images={currentEx?.images ?? []} height={170} showCaption={false} />
        <Row style={{ gap: 12 }}>
          <Bell kg={bell} size={36} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.exercise} numberOfLines={2} adjustsFontSizeToFit>
              {slot ? exerciseName(slot.item.exerciseId) : ''}
            </Text>
            <Text style={styles.reps}>
              {slot ? repsLabel(slot.item, slot.reps).replace(' / side', ' per side') : ''}
              {bell ? ` · ${slot?.item.twoBells ? '2 × ' : ''}${bell} kg` : ''}
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
          {!nextSlot
            ? 'Last one — finish strong.'
            : plan.format === 'sets' && nextSlot.item === slot?.item
              ? `Next: ${nextSlot.label.toLowerCase()} · ${repsLabel(nextSlot.item, nextSlot.reps).replace(' / side', ' per side')}`
              : `Next: ${exerciseName(nextSlot.item.exerciseId).toLowerCase()} · ${repsLabel(nextSlot.item, nextSlot.reps).replace(' / side', ' per side')}`}
        </Text>
        {nextSlot && bell ? <KgTag kg={bell} /> : null}
      </Row>

      <ExerciseHowToSheet exercise={currentEx} visible={howTo} onClose={() => setHowTo(false)} />

      <View style={{ marginTop: 'auto', gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          onPress={onMainPress}
          style={({ pressed }) => [styles.done, stepped && styles.nextButton, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.doneLabel, stepped && { color: colors.text }]}
          >
            {mainLabel}
          </Text>
          {mainHint ? <Text style={styles.doneHint}>{mainHint}</Text> : null}
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
