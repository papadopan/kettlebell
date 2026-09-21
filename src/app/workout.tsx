import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell, KgTag } from '@/components/Bell';
import { IconButton, Row, Screen } from '@/components/ui';
import { emom } from '@/data/mock';
import { bellColor, colors, fonts } from '@/theme';

type Credit = { reps: number; kg: number };

export default function Workout() {
  const params = useLocalSearchParams<{ minutes?: string }>();
  const [total] = useState(Number(params.minutes ?? 20) || 20);
  const [minute, setMinute] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [paused, setPaused] = useState(false);
  const [credits, setCredits] = useState<Record<number, Credit>>({});
  const kg = { odd: emom.odd.kg, even: emom.even.kg };
  const elapsed = useRef(0);

  const isOdd = minute % 2 === 1;
  const current = isOdd ? emom.odd : emom.even;
  const next = isOdd ? emom.even : emom.odd;
  const currentKg = isOdd ? kg.odd : kg.even;
  const nextKg = isOdd ? kg.even : kg.odd;

  const moved = Object.values(credits).reduce((a, c) => a + c.kg, 0);
  const reps = Object.values(credits).reduce((a, c) => a + c.reps, 0);
  const doneThisMinute = !!credits[minute];

  const finish = (c = credits) => {
    const list = Object.values(c);
    router.replace({
      pathname: '/summary',
      params: {
        minutes: String(total),
        rounds: String(list.length),
        reps: String(list.reduce((a, x) => a + x.reps, 0)),
        kg: String(list.reduce((a, x) => a + x.kg, 0)),
        seconds: String(elapsed.current),
      },
    });
  };

  useEffect(() => {
    if (paused) return;
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
    const updated = { ...credits, [minute]: { reps: current.repsPerMinute, kg: current.repsPerMinute * currentKg } };
    setCredits(updated);
    if (minute >= total) finish(updated);
  };

  const togglePause = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPaused((p) => !p);
  };

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Screen scroll={false}>
      <Row style={{ justifyContent: 'space-between', paddingTop: 8 }}>
        <IconButton icon="close" label="End workout" onPress={() => finish()} />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={styles.header}>EMOM {total}</Text>
          <Text style={styles.sub}>
            Minute {minute} of {total}
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

      <View style={{ alignItems: 'center' }}>
        <Text style={styles.timer} accessibilityLabel={`${secondsLeft} seconds left in this minute`}>
          {mm}:{ss}
        </Text>
        <Text style={styles.sub}>{paused ? 'Paused' : doneThisMinute ? 'Resting · next exercise starts at 0:00' : 'left in this minute'}</Text>
      </View>

      <View style={[styles.current, { borderColor: bellColor(currentKg), opacity: doneThisMinute ? 0.5 : 1 }]}>
        <Bell kg={currentKg} size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.exercise}>{current.name}</Text>
          <Text style={styles.reps}>
            {current.reps.replace(' / side', ' per side')} · {currentKg} kg
          </Text>
        </View>
      </View>

      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={styles.next}>
          Next: {next.name.toLowerCase()} · {next.reps.replace(' / side', ' per side')}
        </Text>
        <KgTag kg={nextKg} />
      </Row>

      <Row>
        <Text style={styles.pill}>
          Moved <Text style={{ color: colors.text }}>{moved.toLocaleString('en-US')} kg</Text>
        </Text>
        <Text style={styles.pill}>
          Reps <Text style={{ color: colors.text }}>{reps}</Text>
        </Text>
        <Text style={[styles.pill, { color: colors.go }]}>Offline ready</Text>
      </Row>

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
            {doneThisMinute ? (minute >= total ? 'Finish workout' : `Next: ${next.name}`) : 'Done'}
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

const styles = StyleSheet.create({
  header: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text, textTransform: 'uppercase' },
  sub: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
  seg: { flex: 1, height: 6, borderRadius: 3 },
  timer: { fontFamily: fonts.display, fontSize: 150, lineHeight: 150, color: colors.text, fontVariant: ['tabular-nums'] },
  current: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 2 },
  exercise: { fontFamily: fonts.display, fontSize: 34, lineHeight: 34, color: colors.text, textTransform: 'uppercase' },
  reps: { fontFamily: fonts.mono, fontSize: 15, color: colors.text },
  next: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  pill: { flexGrow: 1, fontFamily: fonts.mono, fontSize: 12, color: colors.muted, backgroundColor: colors.surface, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, overflow: 'hidden' },
  done: { height: 88, borderRadius: 20, backgroundColor: colors.go, alignItems: 'center', justifyContent: 'center' },
  doneLabel: { fontFamily: fonts.display, fontSize: 34, color: colors.onGo, textTransform: 'uppercase' },
  pause: { backgroundColor: colors.warn },
  nextButton: { backgroundColor: colors.surface2, borderWidth: 2, borderColor: colors.go },
  doneHint: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, marginTop: 2 },
});
