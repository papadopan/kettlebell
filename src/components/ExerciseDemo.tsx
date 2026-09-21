import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Exercise } from '@/data/exercises';
import { colors, fonts, space, themedStyles } from '@/theme';
import { Bell } from './Bell';
import { Icon } from './Icon';
import { Body, Eyebrow, Row, Title } from './ui';

/**
 * Loops the start and finish photos so the movement reads like a short animation.
 * Shows a placeholder for exercises that have no photos yet.
 */
export function ExerciseDemo({ images, height = 240, showCaption = true }: { images: string[]; height?: number; showCaption?: boolean }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    setFrame(0);
    if (images.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % images.length), 1200);
    return () => clearInterval(t);
  }, [images]);

  if (!images.length) {
    return (
      <View style={[styles.demo, { height, alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
        <Bell color={colors.dim} size={44} filled={false} />
        <Text style={styles.caption}>Photo coming soon</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={[styles.demo, { height }]}>
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
      {showCaption ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={styles.caption}>{frame === 0 ? 'Start position' : 'Finish position'}</Text>
          <Row style={{ gap: 6 }}>
            {images.map((uri, i) => (
              <View key={uri} style={[styles.dot, { backgroundColor: i === frame ? colors.go : colors.line }]} />
            ))}
          </Row>
        </Row>
      ) : null}
    </View>
  );
}

/** Numbered how-to steps for an exercise. */
export function ExerciseSteps({ exercise }: { exercise: Exercise }) {
  return (
    <View style={{ gap: 10 }}>
      {exercise.instructions.map((step, i) => (
        <Row key={i} style={{ alignItems: 'flex-start', gap: 12 }}>
          <Text style={styles.stepNo}>{String(i + 1).padStart(2, '0')}</Text>
          <Body style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>{step}</Body>
        </Row>
      ))}
    </View>
  );
}

/** Sheet with the photos, muscles and steps, opened from the workout screen. The timer keeps running behind it. */
export function ExerciseHowToSheet({ exercise, visible, onClose }: { exercise?: Exercise; visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible && !!exercise} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {exercise ? (
        <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
          <Row style={{ justifyContent: 'space-between', paddingHorizontal: space.gutter, paddingTop: 12 }}>
            <Eyebrow>How to do it</Eyebrow>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={styles.close} hitSlop={8}>
              <Icon name="close" size={20} />
            </Pressable>
          </Row>
          <ScrollView contentContainerStyle={{ padding: space.gutter, gap: 16 }}>
            <Title size={36}>{exercise.name}</Title>
            <ExerciseDemo images={exercise.images} />
            <Body muted style={{ fontSize: 14 }}>
              Works <Text style={{ color: colors.text, fontFamily: fonts.bodySemi }}>{exercise.primary.join(', ')}</Text>
              {exercise.secondary.length ? ` · also ${exercise.secondary.join(', ')}` : ''}
            </Body>
            <ExerciseSteps exercise={exercise} />
            <Text style={styles.note}>The timer keeps running while this is open.</Text>
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    demo: { borderRadius: 16, backgroundColor: colors.surface2, overflow: 'hidden' },
    caption: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
    dot: { width: 8, height: 8, borderRadius: 4 },
    stepNo: { fontFamily: fonts.mono, fontSize: 13, color: colors.goText, paddingTop: 2 },
    sheet: { flex: 1, backgroundColor: colors.bg },
    close: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
    note: { fontFamily: fonts.body, fontSize: 12, color: colors.dim },
  }),
);
