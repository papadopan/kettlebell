import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Icon } from '@/components/Icon';
import { BackLink, Body, Button, Eyebrow, IconButton, Row, Screen, Title } from '@/components/ui';
import { findExercise } from '@/data/exercises';
import { levelLabel } from '@/data/labels';
import { defaultBell, exerciseName, generateWorkout, getWorkout, Group, groupLabel, needsPair, repsLabel, totals, usableWeights, WorkoutItem } from '@/data/workouts';
import { useBells } from '@/store/bells';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

function ItemRow({ item, index, bell }: { item: WorkoutItem; index: number; bell?: number }) {
  const ex = findExercise(item.exerciseId);
  const kg = bell ?? 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens the exercise"
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.exerciseId } })}
      style={({ pressed }) => [styles.line, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.thumb}>
        {ex?.images[0] ? <Image source={{ uri: ex.images[0] }} style={styles.thumbImg} /> : <Bell kg={kg} size={24} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name} numberOfLines={1}>
          {exerciseName(item.exerciseId)}
        </Text>
        <Text style={styles.note}>Minute {index + 1}{item.twoBells ? ' · both bells' : ''}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={styles.mono}>{repsLabel(item)}</Text>
      </View>
    </Pressable>
  );
}

export default function Routine() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const params = useLocalSearchParams<{ kg?: string }>();
  const { owned, level } = useBells();
  const w = getWorkout(id ?? '');
  const options = w ? usableWeights(w, owned) : [];
  const [bell, setBell] = useState<number | undefined>(() =>
    params.kg && options.includes(Number(params.kg)) ? Number(params.kg) : defaultBell(options, level),
  );

  if (!w) {
    return (
      <Screen>
        <BackLink label="Back" />
        <Title>Workout not found</Title>
        <Body muted>Built workouts are kept until you close the app. Build a new one from the Workouts tab.</Body>
      </Screen>
    );
  }

  const pair = needsPair(w);
  const t = totals(w, bell ?? 0);
  const rounds = w.minutes / w.items.length;

  return (
    <Screen
      footer={
        <Row>
          {w.generated ? (
            <Button
              label="Shuffle"
              variant="secondary"
              onPress={() => {
                const next = generateWorkout({ group: w.group as Group, minutes: w.minutes, goal: w.goal ?? 'Strength', pair });
                router.setParams({ id: next.id, kg: bell ? String(bell) : undefined });
              }}
            />
          ) : null}
          <Button
            label={bell ? `Start with ${pair ? '2 × ' : ''}${bell} kg` : 'Pick a bell first'}
            variant={bell ? 'primary' : 'secondary'}
            onPress={() => bell && router.push({ pathname: '/workout', params: { id: w.id, kg: String(bell) } })}
          />
        </Row>
      }
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <BackLink label="Back" />
        <IconButton
          icon="share"
          label="Share workout"
          onPress={() =>
            Share.share({ message: `Kettlebelt workout: ${w.name} (${w.minutes} min EMOM) — ${w.items.map((i) => exerciseName(i.exerciseId)).join(', ')}` })
          }
        />
      </Row>
      <View style={{ gap: 6 }}>
        <Eyebrow color={colors.goText}>
          {groupLabel(w.group)} · {w.minutes} min · {levelLabel(w.level)}
        </Eyebrow>
        <Title>{w.name}</Title>
      </View>
      <Body muted style={{ fontSize: 14 }}>
        {w.about}
      </Body>

      <View style={styles.how}>
        <Icon name="today" size={18} color={colors.goText} />
        <Text style={styles.howText}>
          EMOM: at the start of every minute, do the next exercise, then rest until the minute ends.
          {Number.isInteger(rounds) ? ` ${rounds} rounds of the list below.` : ''}
        </Text>
      </View>

      <View style={styles.bellBox}>
        <Eyebrow>{pair ? 'Your pair of bells' : 'Your bell'}</Eyebrow>
        {options.length ? (
          <>
            <View style={styles.bellRow}>
              {options.map((kg) => {
                const on = kg === bell;
                return (
                  <Pressable
                    key={kg}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${pair ? 'Two' : 'One'} ${kg} kilogram ${pair ? 'bells' : 'bell'}`}
                    onPress={() => setBell(kg)}
                    style={[styles.bellChip, { borderColor: on ? bellColor(kg) : colors.surface2 }]}
                  >
                    <Row style={{ gap: 2 }}>
                      <Bell kg={kg} size={22} filled={on} />
                      {pair ? <Bell kg={kg} size={22} filled={on} /> : null}
                    </Row>
                    <Text style={[styles.mono, { color: on ? colors.text : colors.muted }]}>{kg} kg</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.note}>
              {pair
                ? 'Some exercises use both bells, the rest use one of them. Same weight for the whole workout.'
                : 'The whole workout uses this one bell. Pick a heavier one when it feels easy.'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.note}>
              {pair ? 'This workout needs two bells of the same weight, and you don’t have a pair yet.' : 'Add your bells first.'}
            </Text>
            <Button label="Edit my bells" variant="secondary" height={44} onPress={() => router.push('/onboarding/bells')} />
          </>
        )}
      </View>

      <View>
        {w.items.map((item, i) => (
          <ItemRow key={`${item.exerciseId}-${i}`} item={item} index={i} bell={bell} />
        ))}
      </View>

      <View style={styles.totals}>
        <Text style={[styles.mono, { color: colors.muted }]}>Whole workout</Text>
        <Text style={styles.mono}>
          {t.reps} reps · {t.kg.toLocaleString('en-US')} kg
        </Text>
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line },
    thumb: { width: 48, height: 48, borderRadius: 10, backgroundColor: colors.surface2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    thumbImg: { width: 48, height: 48 },
    name: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
    note: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
    mono: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
    how: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, backgroundColor: colors.surface },
    howText: { flex: 1, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
    bellBox: { gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.surface },
    bellRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    bellChip: { minWidth: 72, height: 64, borderRadius: 12, borderWidth: 2, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 10 },
    totals: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 12, backgroundColor: colors.surface },
  }),
);
