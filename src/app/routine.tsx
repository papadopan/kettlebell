import { router, useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { BackLink, Body, Button, Eyebrow, IconButton, Row, Screen, Title } from '@/components/ui';
import { emom, emomTotals, ExerciseLine, warmup } from '@/data/mock';
import { colors, fonts, themedStyles } from '@/theme';

function Line({ e }: { e: ExerciseLine }) {
  return (
    <View style={styles.line}>
      <Bell kg={e.kg} size={24} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name}>{e.name}</Text>
        {e.note ? <Text style={styles.note}>{e.note}</Text> : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={styles.mono}>{e.reps}</Text>
        <Text style={[styles.mono, { color: colors.muted, fontSize: 12 }]}>{e.kg} kg</Text>
      </View>
    </View>
  );
}

function Block({ title, meta, items }: { title: string; meta: string; items: ExerciseLine[] }) {
  return (
    <View>
      <Row style={{ justifyContent: 'space-between', paddingBottom: 8 }}>
        <Text style={styles.blockTitle}>{title}</Text>
        <Text style={[styles.mono, { color: colors.muted, fontSize: 12 }]}>{meta}</Text>
      </Row>
      {items.map((e) => (
        <Line key={e.name} e={e} />
      ))}
    </View>
  );
}

export default function Routine() {
  const params = useLocalSearchParams<{ minutes?: string; goal?: string }>();
  const minutes = Number(params.minutes ?? 20) || 20;
  const goal = params.goal ?? 'Strength';
  const totals = emomTotals(minutes);
  const title = `EMOM ${minutes} · ${goal}`;

  return (
    <Screen
      footer={
        <Row>
          <Button label="Shuffle" variant="secondary" />
          <Button label="Start" onPress={() => router.push({ pathname: '/workout', params: { minutes: String(minutes) } })} />
        </Row>
      }
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <BackLink label="Edit" />
        <IconButton
          icon="share"
          label="Share routine"
          onPress={() => Share.share({ message: `Try my Kettlebelt routine: ${title} — swings and cleans, built for your own bells.` })}
        />
      </Row>
      <View style={{ gap: 6 }}>
        <Eyebrow color={colors.goText}>Generated · {minutes + 4} min total</Eyebrow>
        <Title>{title}</Title>
      </View>
      <Body muted style={{ fontSize: 14 }}>
        Adds clean practice toward your Bell Path unlock, and swing volume at 20 kg to prepare you for the 24.
      </Body>
      <Block title="Warm-up" meta="4 min" items={warmup} />
      <Block
        title="EMOM"
        meta={`${minutes} min`}
        items={[
          { ...emom.odd, note: 'Odd minutes' },
          { ...emom.even, note: 'Even minutes' },
        ]}
      />
      <View style={styles.totals}>
        <Text style={[styles.mono, { color: colors.muted }]}>Main block</Text>
        <Text style={styles.mono}>
          {totals.reps} reps · {totals.kg.toLocaleString('en-US')} kg
        </Text>
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
  name: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  note: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  mono: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  blockTitle: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text, textTransform: 'uppercase' },
  totals: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderRadius: 12, backgroundColor: colors.surface },
}),
);
