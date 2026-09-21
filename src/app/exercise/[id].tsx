import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ExerciseDemo, ExerciseSteps } from '@/components/ExerciseDemo';
import { BackLink, Body, Eyebrow, Screen, Title } from '@/components/ui';
import { findExercise } from '@/data/exercises';
import { levelLabel, patternLabel } from '@/data/labels';
import { colors, fonts, themedStyles } from '@/theme';

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = findExercise(id ?? '');

  if (!e) {
    return (
      <Screen>
        <BackLink label="Library" />
        <Title>Exercise not found</Title>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackLink label="Library" />
      <ExerciseDemo images={e.images} />
      <View style={{ gap: 6 }}>
        <Eyebrow>{patternLabel(e.pattern)}</Eyebrow>
        <Title size={40}>{e.name}</Title>
      </View>
      <View style={styles.tags}>
        <Tag label={levelLabel(e.level)} />
        <Tag label={e.mechanic === 'isolation' ? 'Isolation' : 'Compound'} />
      </View>

      <View style={{ gap: 8 }}>
        <Eyebrow>Muscles</Eyebrow>
        <Body>
          <Text style={{ fontFamily: fonts.bodySemi }}>{e.primary.join(', ')}</Text>
          {e.secondary.length ? <Text style={{ color: colors.muted }}> · also {e.secondary.join(', ')}</Text> : null}
        </Body>
      </View>

      <View style={{ gap: 10 }}>
        <Eyebrow>How to do it</Eyebrow>
        <ExerciseSteps exercise={e} />
      </View>

      {e.images.length ? <Text style={styles.credit}>Photos and steps: free-exercise-db (public domain)</Text> : null}
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.surface2 },
    tagText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
    credit: { fontFamily: fonts.body, fontSize: 11, color: colors.dim },
  }),
);
