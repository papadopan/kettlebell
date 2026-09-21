import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { KgTag } from '@/components/Bell';
import { Body, Button, Card, Chip, Eyebrow, IconButton, Row, Screen, Title } from '@/components/ui';
import { levelLabel } from '@/data/labels';
import { exerciseName, GROUPS, loadFor, repsLabel, Workout, workouts } from '@/data/workouts';
import { Level, useBells } from '@/store/bells';
import { useTheme } from '@/store/theme';
import { colors, fonts, themedStyles } from '@/theme';

const STATS = [
  { value: '3', label: 'sessions this week' },
  { value: '4,210', label: 'kg moved' },
  { value: '12', label: 'day streak' },
];

/** Suggest a full-body workout that matches the level chosen during onboarding. */
function suggestion(level: Level): Workout {
  const wanted = level === 'new' ? 'beginner' : level === 'some' ? 'intermediate' : 'advanced';
  return workouts.find((w) => w.group === 'full' && w.level === wanted) ?? workouts[0];
}

export default function Today() {
  const { weights, level } = useBells();
  const { mode, toggle } = useTheme();
  const w = suggestion(level);

  return (
    <Screen inTabs>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20 }}>
        <View style={{ gap: 6 }}>
          <Eyebrow>Tuesday · week 3</Eyebrow>
          <Title>Good morning</Title>
        </View>
        <IconButton
          icon={mode === 'dark' ? 'sun' : 'moon'}
          label={mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onPress={toggle}
        />
      </Row>

      <Row style={{ alignItems: 'stretch' }}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </Row>

      <Card>
        <Eyebrow color={colors.goText}>Suggested for today</Eyebrow>
        <Text style={styles.cardTitle}>{w.name}</Text>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body muted style={{ fontSize: 14, flex: 1 }}>
            {w.minutes} min · {levelLabel(w.level)} · uses your {weights.join(', ')} kg bells
          </Body>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => router.push('/onboarding/bells')}>
            <Text style={styles.link}>Edit bells</Text>
          </Pressable>
        </Row>
        <View style={styles.lines}>
          {w.items.map((item, i) => (
            <Row key={`${item.exerciseId}-${i}`} style={{ justifyContent: 'space-between' }}>
              <Body style={{ fontSize: 14, flex: 1 }} numberOfLines={1}>
                {exerciseName(item.exerciseId)} · {repsLabel(item)}
              </Body>
              {loadFor(item.load, weights) ? <KgTag kg={loadFor(item.load, weights)} /> : null}
            </Row>
          ))}
        </View>
        <Row>
          <Button label="More workouts" variant="secondary" onPress={() => router.navigate('/(tabs)/workouts')} />
          <Button label="Start" onPress={() => router.push({ pathname: '/routine', params: { id: w.id } })} />
        </Row>
      </Card>

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
    link: { fontFamily: fonts.body, fontSize: 13, color: colors.goText },
    groups: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  }),
);
