import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { BackLink, Body, Eyebrow, Row, Screen, Title } from '@/components/ui';
import { findExercise } from '@/data/exercises';
import { levelLabel, patternLabel } from '@/data/labels';
import { colors, fonts, themedStyles } from '@/theme';

/** Alternates the start and finish photos so the movement reads like a short loop. */
function Demo({ images }: { images: string[] }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % images.length), 1200);
    return () => clearInterval(t);
  }, [images.length]);

  if (!images.length) {
    return (
      <View style={[styles.demo, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
        <Bell color={colors.dim} size={48} filled={false} />
        <Text style={styles.caption}>Photo coming soon</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.demo}>
        {images.map((uri, i) => (
          <Image
            key={uri}
            source={{ uri }}
            resizeMode="contain"
            style={[StyleSheet.absoluteFill, { opacity: i === frame ? 1 : 0 }]}
            accessibilityLabel={i === 0 ? 'Start position' : 'Finish position'}
          />
        ))}
      </View>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={styles.caption}>{frame === 0 ? 'Start position' : 'Finish position'}</Text>
        <Row style={{ gap: 6 }}>
          {images.map((uri, i) => (
            <View key={uri} style={[styles.dot, { backgroundColor: i === frame ? colors.go : colors.line }]} />
          ))}
        </Row>
      </Row>
    </View>
  );
}

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
      <Demo images={e.images} />
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
        {e.instructions.map((step, i) => (
          <Row key={i} style={{ alignItems: 'flex-start', gap: 12 }}>
            <Text style={styles.stepNo}>{String(i + 1).padStart(2, '0')}</Text>
            <Body style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{step}</Body>
          </Row>
        ))}
      </View>

      {e.images.length ? <Text style={styles.credit}>Photos and steps: free-exercise-db (public domain)</Text> : null}
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    demo: { height: 240, borderRadius: 16, backgroundColor: colors.surface2, overflow: 'hidden' },
    caption: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
    dot: { width: 8, height: 8, borderRadius: 4 },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.surface2 },
    tagText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
    stepNo: { fontFamily: fonts.mono, fontSize: 13, color: colors.goText, paddingTop: 2 },
    credit: { fontFamily: fonts.body, fontSize: 11, color: colors.dim },
  }),
);
