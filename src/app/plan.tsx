import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { BackLink, Body, Button, Chip, Eyebrow, Row, Screen, tap, Title } from '@/components/ui';
import {
  blockProgress, BLOCK_WEEKS, daysOfWeek, nextDay, ProgramDay, weekNote, weekProgress,
} from '@/data/programs';
import { formatLabel, lengthLabel, workouts, Workout } from '@/data/workouts';
import { useMyWorkouts } from '@/store/myWorkouts';
import { useProgram } from '@/store/program';
import { colors, fonts, space, themedStyles } from '@/theme';

/** Pick a replacement for a planned day: one of yours first, then the ready-made list. */
function SwapSheet({ visible, onPick, onClose }: { visible: boolean; onPick: (w: Workout) => void; onClose: () => void }) {
  const { mine } = useMyWorkouts();
  const groups: { label: string; list: Workout[] }[] = [
    { label: 'Yours', list: mine },
    { label: 'Ready-made', list: workouts },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: space.gutter, paddingTop: 12 }}>
          <Eyebrow>Swap this day for</Eyebrow>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close} hitSlop={8}>
            <Icon name="close" size={20} />
          </Pressable>
        </Row>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: 24, paddingTop: 8 }}>
          {groups.map((g) =>
            g.list.length ? (
              <View key={g.label} style={{ gap: 4, marginTop: 14 }}>
                <Eyebrow color={g.label === 'Yours' ? colors.goText : colors.muted}>{g.label}</Eyebrow>
                {g.list.map((w) => (
                  <Pressable
                    key={w.id}
                    accessibilityRole="button"
                    onPress={() => {
                      tap();
                      onPick(w);
                    }}
                    style={({ pressed }) => [styles.pickRow, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.pickName} numberOfLines={1}>
                        {w.name}
                      </Text>
                      <Text style={styles.meta}>
                        {formatLabel(w.format)} · {lengthLabel(w)}
                      </Text>
                    </View>
                    <Icon name="chevron" size={18} color={colors.dim} />
                  </Pressable>
                ))}
              </View>
            ) : null,
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DayRow({ day, onOpen }: { day: ProgramDay; onOpen: () => void }) {
  const done = day.status === 'done';
  const skipped = day.status === 'skipped';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Day ${day.dayOfWeek}: ${day.title}`}
      onPress={onOpen}
      style={({ pressed }) => [styles.day, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.dot, done && { backgroundColor: colors.go, borderColor: colors.go }, skipped && { borderColor: colors.dim }]}>
        {done ? <Icon name="check" size={14} color={colors.onGo} strokeWidth={3} /> : skipped ? <Text style={styles.dash}>–</Text> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.dayTitle, (done || skipped) && { color: colors.muted }]} numberOfLines={1}>
          {day.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatLabel(day.workout.format)} · {lengthLabel(day.workout)}
          {day.swapped ? (day.workout.custom ? ' · yours' : ' · swapped') : ''}
          {skipped ? ' · skipped' : ''}
        </Text>
      </View>
      <Icon name="chevron" size={18} color={colors.dim} />
    </Pressable>
  );
}

export default function Plan() {
  const { block, ready, complete, skip, reopen, swap, abandon } = useProgram();
  const [open, setOpen] = useState<ProgramDay | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [stopping, setStopping] = useState(false);

  if (!ready) {
    return (
      <Screen>
        <BackLink label="Back" />
        <Title>Your plan</Title>
      </Screen>
    );
  }

  if (!block) {
    return (
      <Screen footer={<Button label="Build my plan" onPress={() => router.push('/plan-start')} />}>
        <BackLink label="Back" />
        <Title size={44}>Your plan</Title>
        <Body muted style={{ fontSize: 14 }}>
          A four-week block of workouts in order, built from the bells you own. No fixed days: do the next one
          whenever you train.
        </Body>
      </Screen>
    );
  }

  const progress = blockProgress(block);
  const up = nextDay(block);

  return (
    <Screen
      footer={
        up ? (
          <Button
            label={`Start ${up.title.toLowerCase()}`}
            onPress={() => router.push({ pathname: '/routine', params: { id: up.workout.id } })}
          />
        ) : (
          <Button label="Start a new block" onPress={() => router.push('/plan-start')} />
        )
      }
    >
      <BackLink label="Back" />
      <View style={{ gap: 6 }}>
        <Eyebrow color={colors.goText}>
          {block.name} · {block.daysPerWeek} days a week
        </Eyebrow>
        <Title size={40}>{up ? `Week ${up.week}` : 'Block complete'}</Title>
      </View>

      <View style={styles.progressBox}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={styles.mono}>
            {progress.done} of {progress.total} done
          </Text>
          <Text style={[styles.mono, { color: colors.muted }]}>{Math.round(progress.percent * 100)}%</Text>
        </Row>
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${Math.max(2, progress.percent * 100)}%` }]} />
        </View>
        <Text style={styles.hint}>
          {up
            ? `${weekProgress(block, up.week).done} of ${weekProgress(block, up.week).total} this week. ${weekNote(up.week)}`
            : 'Every day is behind you. Start a new block to keep going — heavier, or a level up.'}
        </Text>
      </View>

      {Array.from({ length: BLOCK_WEEKS }, (_, i) => i + 1).map((week) => {
        const wp = weekProgress(block, week);
        return (
          <View key={week} style={{ gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Eyebrow color={up && week === up.week ? colors.goText : colors.muted}>
                Week {week}
                {week === BLOCK_WEEKS ? ' · lighter' : ''}
              </Eyebrow>
              <Text style={styles.meta}>
                {wp.done}/{wp.total}
              </Text>
            </Row>
            {daysOfWeek(block, week).map((d) => (
              <DayRow key={d.index} day={d} onOpen={() => setOpen(d)} />
            ))}
          </View>
        );
      })}

      <View style={{ gap: 8, paddingTop: 4 }}>
        <Button label="Stop this plan" variant="ghost" height={44} onPress={() => setStopping(true)} />
        <Text style={[styles.hint, { textAlign: 'center' }]}>
          Everything you have logged stays in your stats.
        </Text>
      </View>

      <Modal visible={stopping} transparent animationType="fade" onRequestClose={() => setStopping(false)}>
        <Pressable style={styles.backdrop} onPress={() => setStopping(false)}>
          <Pressable style={styles.actions} onPress={(e) => e.stopPropagation()}>
            <View style={{ gap: 6 }}>
              <Text style={styles.actionTitle}>Stop this plan?</Text>
              <Text style={styles.body}>
                {progress.done > 0
                  ? `You are ${progress.done} of ${progress.total} days in. `
                  : 'You have not started it yet. '}
                The remaining {block.days.filter((d) => d.status === 'todo').length} days will not continue, and this
                block goes away.
              </Text>
            </View>

            <View style={styles.keep}>
              <Icon name="check" size={16} color={colors.goText} strokeWidth={3} />
              <Text style={styles.keepText}>
                Every session you saved stays in your log and your stats — kilograms, streaks and personal bests are
                all untouched.
              </Text>
            </View>

            <Button
              label="Stop the plan"
              variant="danger"
              onPress={() => {
                abandon();
                setStopping(false);
                router.replace('/(tabs)');
              }}
            />
            <Button label="Keep going" variant="secondary" onPress={() => setStopping(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(null)}>
          <Pressable style={styles.actions} onPress={(e) => e.stopPropagation()}>
            <View style={{ gap: 2 }}>
              <Text style={styles.actionTitle}>{open?.title}</Text>
              <Text style={styles.meta}>
                Week {open?.week} · day {open?.dayOfWeek}
                {open?.plannedTitle ? ` · planned: ${open.plannedTitle}` : ''}
              </Text>
            </View>
            <Button
              label={open?.status === 'done' ? 'Do it again' : 'Start this one'}
              onPress={() => {
                const d = open;
                setOpen(null);
                if (d) router.push({ pathname: '/routine', params: { id: d.workout.id } });
              }}
            />
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              <Chip
                label="Swap"
                onPress={() => {
                  setSwapping(true);
                }}
              />
              {open?.status === 'todo' ? (
                <>
                  <Chip label="Skip" onPress={() => { if (open) skip(open.index); setOpen(null); }} />
                  <Chip label="Mark done" onPress={() => { if (open) complete(open.index); setOpen(null); }} />
                </>
              ) : (
                <Chip label="Put it back" onPress={() => { if (open) reopen(open.index); setOpen(null); }} />
              )}
            </Row>
            <Text style={styles.hint}>
              Swapping keeps this day in the block — it still counts toward the four weeks.
            </Text>
          </Pressable>
        </Pressable>
      </Modal>

      <SwapSheet
        visible={swapping}
        onClose={() => setSwapping(false)}
        onPick={(w) => {
          if (open) swap(open.index, w);
          setSwapping(false);
          setOpen(null);
        }}
      />
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    mono: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
    meta: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
    hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted },
    progressBox: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.surface },
    track: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, overflow: 'hidden' },
    trackFill: { height: 8, borderRadius: 4, backgroundColor: colors.go },
    day: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: colors.surface },
    dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
    dash: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.dim },
    dayTitle: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    actions: { gap: 12, padding: 20, paddingBottom: 34, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: colors.bg },
    actionTitle: { fontFamily: fonts.displayBold, fontSize: 26, color: colors.text, textTransform: 'uppercase' },
    body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.muted },
    keep: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, borderRadius: 12, backgroundColor: colors.surface },
    keepText: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
    sheet: { flex: 1, backgroundColor: colors.bg },
    close: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    pickRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
    pickName: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  }),
);
