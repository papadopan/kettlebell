import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { BackLink, Body, Button, Chip, Eyebrow, Row, Screen, Title } from '@/components/ui';
import { ExerciseLevel } from '@/data/exercises';
import { BLOCK_WEEKS, levelFor, levelName, WEEK_NOTES } from '@/data/programs';
import { useBells } from '@/store/bells';
import { useProgram } from '@/store/program';
import { colors, fonts, themedStyles } from '@/theme';

const LEVELS: { id: ExerciseLevel; blurb: string }[] = [
  { id: 'beginner', blurb: 'Shorter sessions, the basics, plenty of rest.' },
  { id: 'intermediate', blurb: 'Longer EMOMs, straight sets and intervals.' },
  { id: 'advanced', blurb: 'Heavier, longer, ladders and double-bell work.' },
];

const DAYS = [2, 3, 4, 5];

export default function PlanStart() {
  const { level: ownLevel, daysPerWeek: ownDays, rack } = useBells();
  const { block, start } = useProgram();
  const [level, setLevel] = useState<ExerciseLevel>(levelFor(ownLevel));
  const [days, setDays] = useState(ownDays || 3);

  const pair = rack.some((kg, i) => rack.indexOf(kg) !== i);
  const total = days * BLOCK_WEEKS;

  return (
    <Screen
      footer={
        <Button
          label={block ? 'Replace my plan' : `Start ${BLOCK_WEEKS} weeks`}
          onPress={() => {
            start({ level, daysPerWeek: days, pair });
            router.replace('/plan');
          }}
        />
      }
    >
      <BackLink label="Back" />
      <View style={{ gap: 6 }}>
        <Eyebrow color={colors.goText}>{BLOCK_WEEKS}-week block</Eyebrow>
        <Title size={44}>Your plan</Title>
      </View>
      <Body muted style={{ fontSize: 14 }}>
        A run of workouts in order, built from your bells. There are no fixed days — do the next one whenever you
        train, and the plan waits for you.
      </Body>

      <View style={styles.section}>
        <Eyebrow>Level</Eyebrow>
        <View style={styles.wrap}>
          {LEVELS.map((l) => (
            <Chip key={l.id} label={levelName(l.id)} selected={level === l.id} onPress={() => setLevel(l.id)} />
          ))}
        </View>
        <Text style={styles.hint}>{LEVELS.find((l) => l.id === level)?.blurb}</Text>
      </View>

      <View style={styles.section}>
        <Eyebrow>Days a week you are aiming for</Eyebrow>
        <View style={styles.wrap}>
          {DAYS.map((d) => (
            <Chip key={d} label={`${d} days`} selected={days === d} onPress={() => setDays(d)} />
          ))}
        </View>
        <Text style={styles.hint}>
          {total} workouts over {BLOCK_WEEKS} weeks. Miss one and nothing breaks — you are just a day further back.
        </Text>
      </View>

      <View style={styles.weeks}>
        {WEEK_NOTES.map((note, i) => (
          <Row key={i} style={{ gap: 12, alignItems: 'flex-start' }}>
            <View style={[styles.pip, i === 3 && { backgroundColor: colors.warn }]}>
              <Text style={[styles.pipText, i === 3 && { color: colors.onWarn }]}>{i + 1}</Text>
            </View>
            <Text style={styles.weekNote}>{note}</Text>
          </Row>
        ))}
      </View>

      {block ? (
        <Row style={{ gap: 10, alignItems: 'flex-start' }}>
          <Icon name="today" size={18} color={colors.warn} />
          <Text style={styles.warn}>
            Starting a new block replaces the one you are on. Sessions you already logged are kept.
          </Text>
        </Row>
      ) : null}
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    section: { gap: 10 },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hint: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted },
    weeks: { gap: 12, padding: 14, borderRadius: 14, backgroundColor: colors.surface },
    pip: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.go, alignItems: 'center', justifyContent: 'center' },
    pipText: { fontFamily: fonts.mono, fontSize: 13, color: colors.onGo },
    weekNote: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
    warn: { flex: 1, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted },
  }),
);
