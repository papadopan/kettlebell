import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Body, Button, Card, Chip, Eyebrow, IconButton, Row, Screen, Title } from '@/components/ui';
import { levelLabel } from '@/data/labels';
import { blockProgress, nextDay, weekProgress } from '@/data/programs';
import { weeks, weekStreak } from '@/data/stats';
import { defaultBell, exerciseName, formatLabel, GROUPS, lengthLabel, repsLabel, usableWeights, Workout, workouts } from '@/data/workouts';
import { Level, useBells } from '@/store/bells';
import { useProgram } from '@/store/program';
import { useSessions } from '@/store/sessions';
import { useTheme } from '@/store/theme';
import { colors, fonts, themedStyles } from '@/theme';

/** Suggest a full-body workout for the user's level that works with the bells they own. */
function suggestion(level: Level, owned: Record<number, number>): Workout {
  const wanted = level === 'new' ? 'beginner' : level === 'some' ? 'intermediate' : 'advanced';
  const doable = workouts.filter((w) => usableWeights(w, owned).length > 0);
  return (
    doable.find((w) => w.group === 'full' && w.level === wanted) ?? doable.find((w) => w.group === 'full') ?? doable[0] ?? workouts[0]
  );
}

export default function Today() {
  const { owned, level } = useBells();
  const { mode, toggle } = useTheme();
  const { sessions } = useSessions();
  const { block } = useProgram();
  const w = suggestion(level, owned);
  const bell = defaultBell(usableWeights(w, owned), level);

  const thisWeek = weeks(sessions, 1)[0];
  const stats = [
    { value: `${thisWeek?.sessions ?? 0}`, label: 'sessions' },
    { value: (thisWeek?.kg ?? 0).toLocaleString('en-US'), label: 'kg moved' },
    { value: `${weekStreak(sessions)}`, label: 'week streak' },
  ];

  const up = block ? nextDay(block) : undefined;
  const progress = block ? blockProgress(block) : undefined;
  const week = block && up ? weekProgress(block, up.week) : undefined;
  const upBell = up ? defaultBell(usableWeights(up.workout, owned), level) : undefined;

  return (
    <Screen inTabs>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20 }}>
        <View style={{ gap: 6 }}>
          <Eyebrow>{block && up ? `${block.name} · week ${up.week}` : 'No plan yet'}</Eyebrow>
          <Title>Good morning</Title>
        </View>
        <IconButton
          icon={mode === 'dark' ? 'sun' : 'moon'}
          label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onPress={toggle}
        />
      </Row>

      <Eyebrow>This week</Eyebrow>
      <Row style={{ alignItems: 'stretch' }}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </Row>

      {block && up ? (
        <Card>
          <Eyebrow color={colors.goText}>
            Next up · week {up.week}, day {up.dayOfWeek}
          </Eyebrow>
          <Text style={styles.cardTitle}>{up.title}</Text>
          <Row style={{ gap: 8 }}>
            {upBell ? <Bell kg={upBell} size={22} /> : null}
            <Body muted style={{ fontSize: 14, flex: 1 }}>
              {formatLabel(up.workout.format)} · {lengthLabel(up.workout)}
              {upBell ? ` · one ${upBell} kg bell` : ''}
            </Body>
          </Row>
          <View style={styles.planBar}>
            <View style={[styles.planFill, { width: `${Math.max(2, (progress?.percent ?? 0) * 100)}%` }]} />
          </View>
          <Body muted style={{ fontSize: 12 }}>
            {progress?.done} of {progress?.total} done · {week?.done}/{week?.total} this week
          </Body>
          <Row>
            <Button label="See the plan" variant="secondary" onPress={() => router.push('/plan')} />
            <Button
              label="Start"
              onPress={() =>
                router.push({ pathname: '/routine', params: upBell ? { id: up.workout.id, kg: String(upBell) } : { id: up.workout.id } })
              }
            />
          </Row>
        </Card>
      ) : block ? (
        <Card>
          <Eyebrow color={colors.goText}>Block complete</Eyebrow>
          <Text style={styles.cardTitle}>All four weeks done</Text>
          <Body muted style={{ fontSize: 14 }}>
            Every day is behind you. Start the next block — a level up, or the same one with a heavier bell.
          </Body>
          <Button label="Start a new block" onPress={() => router.push('/plan-start')} />
        </Card>
      ) : (
        <Card>
          <Eyebrow color={colors.goText}>Train with a plan</Eyebrow>
          <Text style={styles.cardTitle}>Four weeks, in order</Text>
          <Body muted style={{ fontSize: 14 }}>
            Pick your level and how many days a week you are aiming for. We build the block from the bells you own —
            no fixed days, so a missed session never breaks it.
          </Body>
          <Button label="Build my plan" onPress={() => router.push('/plan-start')} />
        </Card>
      )}

      {up ? null : (
      <Card>
        <Eyebrow color={colors.goText}>Suggested for today</Eyebrow>
        <Text style={styles.cardTitle}>{w.name}</Text>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 8, flex: 1 }}>
            {bell ? <Bell kg={bell} size={22} /> : null}
            <Body muted style={{ fontSize: 14, flex: 1 }}>
              {w.minutes} min · {levelLabel(w.level)}
              {bell ? ` · one ${bell} kg bell` : ''}
            </Body>
          </Row>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/onboarding/bells')}>
            <Text style={styles.link}>Edit bells</Text>
          </Pressable>
        </Row>
        <View style={styles.lines}>
          {w.items.map((item, i) => (
            <Row key={`${item.exerciseId}-${i}`} style={{ justifyContent: 'space-between' }}>
              <Body style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>
                {exerciseName(item.exerciseId)}
              </Body>
              <Text style={styles.reps}>{repsLabel(item)}</Text>
            </Row>
          ))}
        </View>
        <Row>
          <Button label="More workouts" variant="secondary" onPress={() => router.navigate('/(tabs)/workouts')} />
          <Button label="Start" onPress={() => router.push({ pathname: '/routine', params: bell ? { id: w.id, kg: String(bell) } : { id: w.id } })} />
        </Row>
      </Card>
      )}

      <Card style={{ gap: 12 }}>
        <Eyebrow>Train by body part</Eyebrow>
        <View style={styles.groups}>
          {GROUPS.map((g) => (
            <Chip key={g.id} label={g.label} onPress={() => router.navigate({ pathname: '/(tabs)/workouts', params: { group: g.id } })} />
          ))}
        </View>
        <Button label="Build your own" variant="secondary" onPress={() => router.push('/generator')} />
      </Card>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, gap: 2 },
    statValue: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 30, color: colors.text },
    statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
    cardTitle: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, color: colors.text, textTransform: 'uppercase' },
    lines: { gap: 8, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
    reps: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
    link: { fontFamily: fonts.body, fontSize: 13, color: colors.goText },
    groups: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    planBar: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, overflow: 'hidden' },
    planFill: { height: 8, borderRadius: 4, backgroundColor: colors.go },
  }),
);
