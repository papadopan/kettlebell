import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bell } from '@/components/Bell';
import { Icon } from '@/components/Icon';
import { BackLink, Body, Button, Chip, Eyebrow, Row, Screen, tap, Title } from '@/components/ui';
import { Exercise, exercises, findExercise } from '@/data/exercises';
import { patternLabel } from '@/data/labels';
import {
  estimateMinutes, exerciseName, Format, FORMATS, formatSpec, getWorkout, Group, groupLabel, GROUPS, lengthLabel, Workout, WorkoutItem,
} from '@/data/workouts';
import { newWorkoutId, useMyWorkouts } from '@/store/myWorkouts';
import { colors, fonts, space, themedStyles } from '@/theme';

const EMOM_TIMES = [10, 16, 20, 30];
const AMRAP_TIMES = [6, 10, 12, 20];
const LADDER_TIMES = [10, 15, 20];
const FORTIME_ROUNDS = [3, 5, 7, 10];
const INTERVAL_ROUNDS = [4, 6, 8, 10];
const SET_COUNTS = [3, 4, 5];
const WORK_SECONDS = [20, 30, 40, 45];
const INTERVAL_REST = [10, 15, 20, 30];
const SET_REST = [60, 90, 120];

/** Sensible starting numbers when you switch format, so nothing is ever blank. */
const DEFAULTS: Record<Format, { minutes: number; rounds: number; workSec: number; restSec: number }> = {
  emom: { minutes: 20, rounds: 5, workSec: 30, restSec: 15 },
  amrap: { minutes: 12, rounds: 5, workSec: 30, restSec: 15 },
  fortime: { minutes: 15, rounds: 5, workSec: 30, restSec: 15 },
  intervals: { minutes: 12, rounds: 8, workSec: 20, restSec: 10 },
  ladder: { minutes: 15, rounds: 5, workSec: 30, restSec: 15 },
  sets: { minutes: 20, rounds: 4, workSec: 30, restSec: 90 },
};

/** Search-and-tap list for adding an exercise to the workout. */
function ExercisePicker({ visible, onPick, onClose }: { visible: boolean; onPick: (e: Exercise) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => !q || e.name.toLowerCase().includes(q) || e.primary.some((m) => m.includes(q)));
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: space.gutter, paddingTop: 12 }}>
          <Eyebrow>Add an exercise</Eyebrow>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close} hitSlop={8}>
            <Icon name="close" size={20} />
          </Pressable>
        </Row>
        <View style={{ paddingHorizontal: space.gutter, paddingVertical: 12 }}>
          <View style={styles.search}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search: swing, press, shoulders…"
              placeholderTextColor={colors.dim}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Search exercises"
            />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          {list.map((e) => (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              onPress={() => {
                tap();
                onPick(e);
              }}
              style={({ pressed }) => [styles.pickRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.thumb}>
                {e.images[0] ? <Image source={{ uri: e.images[0] }} style={styles.thumbImg} /> : <Bell color={colors.dim} size={28} filled={false} />}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.pickName} numberOfLines={2}>
                  {e.name}
                </Text>
                <Text style={styles.meta}>{patternLabel(e.pattern)}</Text>
              </View>
              <Icon name="chevron" size={18} color={colors.dim} />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Stepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <Row style={{ gap: 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`One less ${label}`}
        onPress={() => onChange(Math.max(1, value - 1))}
        style={[styles.step, { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }]}
      >
        <Text style={styles.stepLabel}>−</Text>
      </Pressable>
      <View style={styles.stepValue}>
        <Text style={styles.mono}>{value}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`One more ${label}`}
        onPress={() => onChange(value + 1)}
        style={[styles.step, { borderTopRightRadius: 10, borderBottomRightRadius: 10 }]}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </Row>
  );
}

export default function Builder() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = id ? getWorkout(id) : undefined;
  const { save, remove } = useMyWorkouts();

  const [name, setName] = useState(editing?.name ?? '');
  const [format, setFormat] = useState<Format>(editing?.format ?? 'emom');
  const [minutes, setMinutes] = useState(editing?.minutes ?? 20);
  const [rounds, setRounds] = useState(editing?.rounds ?? 5);
  const [workSec, setWorkSec] = useState(editing?.workSec ?? 30);
  const [restSec, setRestSec] = useState(editing?.restSec ?? 15);
  const [group, setGroup] = useState<Group>(editing?.group ?? 'full');
  const [items, setItems] = useState<WorkoutItem[]>(editing?.items ?? []);
  const [picking, setPicking] = useState(false);

  const spec = formatSpec(format);
  const times = format === 'emom' ? EMOM_TIMES : format === 'ladder' ? LADDER_TIMES : AMRAP_TIMES;
  const roundChoices = format === 'intervals' ? INTERVAL_ROUNDS : format === 'sets' ? SET_COUNTS : FORTIME_ROUNDS;
  const emomRounds = items.length ? minutes / items.length : 0;
  const canSave = items.length > 0;

  const pickFormat = (f: Format) => {
    const d = DEFAULTS[f];
    setFormat(f);
    setMinutes(d.minutes);
    setRounds(d.rounds);
    setWorkSec(d.workSec);
    setRestSec(d.restSec);
  };

  /** A plain-language sentence of what the numbers above add up to. */
  const planLine = (() => {
    const n = items.length;
    const estimate = estimateMinutes({
      group, level: 'intermediate', format, minutes, rounds, workSec, restSec, items,
    } as Workout);
    switch (format) {
      case 'emom':
        return `${minutes} min ÷ ${n} exercises = ${Number.isInteger(emomRounds) ? emomRounds : emomRounds.toFixed(1)} rounds`;
      case 'amrap':
        return `As many rounds of ${n} exercises as you can do in ${minutes} min`;
      case 'fortime':
        return `${rounds} rounds × ${n} exercises = ${rounds * n} sets, as fast as you can (about ${estimate} min)`;
      case 'intervals':
        return `${rounds} rounds × ${n} exercises · ${workSec}s on / ${restSec}s off ≈ ${estimate} min`;
      case 'ladder':
        return `Round 1 the reps below, round 2 double, round 3 triple… up to ${minutes} min`;
      case 'sets':
        return `${rounds} sets × ${n} exercises = ${rounds * n} sets · ${restSec}s rest ≈ ${estimate} min`;
    }
  })();

  const update = (index: number, patch: Partial<WorkoutItem>) =>
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, by: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      const target = index + by;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const about = () => {
    const n = items.length;
    switch (format) {
      case 'emom':
        return `Your own EMOM: ${n} exercises, ${minutes} minutes.`;
      case 'amrap':
        return `Your own AMRAP: ${n} exercises, as many rounds as possible in ${minutes} minutes.`;
      case 'fortime':
        return `Your own for-time workout: ${rounds} rounds of ${n} exercises, as fast as you can.`;
      case 'intervals':
        return `Your own intervals: ${workSec} seconds on, ${restSec} off, ${rounds} rounds of ${n} exercises.`;
      case 'ladder':
        return `Your own ladder: ${n} exercises, reps climbing every round for up to ${minutes} minutes.`;
      case 'sets':
        return `Your own strength session: ${rounds} sets of each of ${n} exercises, ${restSec} seconds rest.`;
    }
  };

  const onSave = () => {
    const workout: Workout = {
      id: editing?.id ?? newWorkoutId(),
      name: name.trim() || `My ${groupLabel(group).toLowerCase()} workout`,
      group,
      level: editing?.level ?? 'intermediate',
      format,
      minutes,
      rounds: spec.length === 'minutes' ? undefined : rounds,
      workSec: format === 'intervals' ? workSec : undefined,
      restSec: format === 'intervals' || format === 'sets' ? restSec : undefined,
      about: about(),
      items,
      custom: true,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    // Formats without a fixed length still need an estimate, for the card and the weekly totals.
    workout.minutes = estimateMinutes(workout);
    save(workout);
    router.replace({ pathname: '/routine', params: { id: workout.id } });
  };

  return (
    <Screen
      footer={
        <>
          <Button label={editing ? 'Save changes' : 'Save workout'} onPress={onSave} variant={canSave ? 'primary' : 'secondary'} />
          {editing ? (
            <Button
              label="Delete workout"
              variant="ghost"
              height={44}
              onPress={() => {
                remove(editing.id);
                router.replace('/(tabs)/workouts');
              }}
            />
          ) : null}
        </>
      }
    >
      <BackLink label="Back" />
      <Title size={44}>{editing ? 'Edit workout' : 'New workout'}</Title>

      <View style={styles.section}>
        <Eyebrow>Name</Eyebrow>
        <View style={styles.search}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Saturday swings"
            placeholderTextColor={colors.dim}
            style={styles.searchInput}
            accessibilityLabel="Workout name"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Eyebrow>Type</Eyebrow>
        <View style={styles.wrap}>
          {FORMATS.map((f) => (
            <Chip
              key={f.id}
              label={f.label}
              selected={format === f.id}
              onPress={() => pickFormat(f.id)}
            />
          ))}
        </View>
        <Text style={styles.hint}>
          <Text style={styles.hintStrong}>{spec.full}. </Text>
          {spec.help}
        </Text>
      </View>

      {spec.length === 'minutes' ? (
        <View style={styles.section}>
          <Eyebrow>{format === 'emom' ? 'Length' : 'Time cap'}</Eyebrow>
          <View style={styles.wrap}>
            {times.map((t) => (
              <Chip key={t} label={`${t} min`} selected={minutes === t} onPress={() => setMinutes(t)} />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Eyebrow>{spec.length === 'sets' ? 'Sets of each exercise' : 'Rounds'}</Eyebrow>
          <View style={styles.wrap}>
            {roundChoices.map((r) => (
              <Chip
                key={r}
                label={spec.length === 'sets' ? `${r} sets` : `${r} rounds`}
                selected={rounds === r}
                onPress={() => setRounds(r)}
              />
            ))}
          </View>
        </View>
      )}

      {format === 'intervals' ? (
        <>
          <View style={styles.section}>
            <Eyebrow>Work</Eyebrow>
            <View style={styles.wrap}>
              {WORK_SECONDS.map((t) => (
                <Chip key={t} label={`${t}s on`} selected={workSec === t} onPress={() => setWorkSec(t)} />
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <Eyebrow>Rest</Eyebrow>
            <View style={styles.wrap}>
              {INTERVAL_REST.map((t) => (
                <Chip key={t} label={`${t}s off`} selected={restSec === t} onPress={() => setRestSec(t)} />
              ))}
            </View>
          </View>
        </>
      ) : null}

      {format === 'sets' ? (
        <View style={styles.section}>
          <Eyebrow>Rest between sets</Eyebrow>
          <View style={styles.wrap}>
            {SET_REST.map((t) => (
              <Chip key={t} label={t >= 60 ? `${t / 60} min` : `${t}s`} selected={restSec === t} onPress={() => setRestSec(t)} />
            ))}
          </View>
        </View>
      ) : null}

      {items.length ? (
        <View style={styles.plan}>
          <Text style={styles.planLine}>{planLine}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Eyebrow>Body part</Eyebrow>
        <View style={styles.wrap}>
          {GROUPS.map((g) => (
            <Chip key={g.id} label={g.label} selected={group === g.id} onPress={() => setGroup(g.id)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Eyebrow>Exercises</Eyebrow>
          <Text style={styles.hint}>{items.length} added</Text>
        </Row>

        {items.map((item, i) => {
          const ex = findExercise(item.exerciseId);
          return (
            <View key={`${item.exerciseId}-${i}`} style={styles.item}>
              <Row style={{ gap: 12, alignItems: 'flex-start' }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${exerciseName(item.exerciseId)}`}
                  onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.exerciseId } })}
                  style={styles.itemThumb}
                >
                  {ex?.images[0] ? (
                    <Image source={{ uri: ex.images[0] }} style={styles.itemThumbImg} />
                  ) : (
                    <Bell color={colors.dim} size={24} filled={false} />
                  )}
                </Pressable>
                <View style={{ flex: 1, gap: 10 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={styles.name} numberOfLines={2}>
                      {format === 'emom' || format === 'ladder' ? `Minute ${i + 1} · ` : ''}
                      {exerciseName(item.exerciseId)}
                    </Text>
                    <Row style={{ gap: 4 }}>
                      <Pressable accessibilityRole="button" accessibilityLabel="Move up" onPress={() => move(i, -1)} style={styles.iconSmall}>
                        <Text style={styles.stepLabel}>↑</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" accessibilityLabel="Move down" onPress={() => move(i, 1)} style={styles.iconSmall}>
                        <Text style={styles.stepLabel}>↓</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Remove"
                        onPress={() => setItems((list) => list.filter((_, index) => index !== i))}
                        style={styles.iconSmall}
                      >
                        <Icon name="close" size={14} color={colors.muted} />
                      </Pressable>
                    </Row>
                  </Row>
                  <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <Stepper value={item.reps} onChange={(reps) => update(i, { reps })} label="rep" />
                    <Row style={{ gap: 6 }}>
                      <Chip label="Per side" selected={!!item.perSide} onPress={() => update(i, { perSide: !item.perSide })} />
                      <Chip label="2 bells" selected={!!item.twoBells} onPress={() => update(i, { twoBells: !item.twoBells })} />
                    </Row>
                  </Row>
                </View>
              </Row>
            </View>
          );
        })}

        <Button label="+ Add exercise" variant="secondary" height={52} onPress={() => setPicking(true)} />
        {items.length === 0 ? <Text style={styles.hint}>Add at least one exercise to save this workout.</Text> : null}
      </View>

      <Body muted style={{ fontSize: 12 }}>
        You pick the bell when you start the workout, so the same one works with any of your kettlebells.
      </Body>

      <ExercisePicker
        visible={picking}
        onClose={() => setPicking(false)}
        onPick={(e) => {
          setItems((list) => [...list, { exerciseId: e.id, reps: 8, perSide: /one-arm|each side/i.test(findExercise(e.id)?.name ?? '') }]);
          setPicking(false);
        }}
      />
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    section: { gap: 10 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted },
    hintStrong: { fontFamily: fonts.bodySemi, color: colors.text },
    plan: { padding: 12, borderRadius: 12, backgroundColor: colors.surface },
    planLine: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, color: colors.muted },
    search: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, height: 48, justifyContent: 'center' },
    searchInput: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
    item: { backgroundColor: colors.surface, borderRadius: 14, padding: 12 },
    itemThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.surface2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    itemThumbImg: { width: 64, height: 64 },
    name: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
    meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
    pickName: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
    mono: { fontFamily: fonts.mono, fontSize: 15, color: colors.text },
    step: { width: 44, height: 44, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
    stepValue: { minWidth: 44, height: 44, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
    stepLabel: { fontFamily: fonts.bodySemi, fontSize: 18, color: colors.text },
    iconSmall: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
    sheet: { flex: 1, backgroundColor: colors.bg },
    close: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    pickRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
    thumb: { width: 76, height: 76, borderRadius: 12, backgroundColor: colors.surface2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    thumbImg: { width: 76, height: 76 },
  }),
);
