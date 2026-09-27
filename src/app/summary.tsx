import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Body, Button, Chip, Eyebrow, IconButton, Row, Screen, Title } from '@/components/ui';
import { Format, FORMATS, formatLabel } from '@/data/workouts';
import { useBells } from '@/store/bells';
import { useSessions } from '@/store/sessions';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

const FEEL = ['Easy', 'About right', 'Hard'];

export default function Summary() {
  const p = useLocalSearchParams<{
    format?: string; bell?: string; name?: string; minutes?: string;
    rounds?: string; target?: string; sets?: string; reps?: string; kg?: string; seconds?: string;
  }>();
  const format: Format = (FORMATS.find((f) => f.id === p.format)?.id ?? 'emom') as Format;
  const [feel, setFeel] = useState('About right');
  const { weights } = useBells();
  const { add } = useSessions();
  const bell = Number(p.bell ?? 0);
  // Progression: after an easy session suggest the next bell you own, or the next standard size if you have none heavier.
  const heavierOwned = weights.find((kg) => kg > bell);
  const nextSize = heavierOwned ?? bell + 4;
  const seconds = Number(p.seconds ?? 0);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const kg = Number(p.kg ?? 0);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const rounds = Number(p.rounds ?? 0);
  const sets = Number(p.sets ?? 0);
  const target = Number(p.target ?? 0);

  // The fourth tile is whatever this format actually counts.
  const scoreTile =
    format === 'amrap' || format === 'intervals'
      ? { value: `${rounds}`, label: 'rounds done' }
      : format === 'fortime'
        ? { value: `${sets}${target ? `/${target}` : ''}`, label: 'sets done' }
        : format === 'sets'
          ? { value: `${sets}${target ? `/${target}` : ''}`, label: 'sets done' }
          : format === 'ladder'
            ? { value: `${rounds}`, label: 'rungs climbed' }
            : { value: `${rounds}${target ? `/${target}` : ''}`, label: 'minutes done' };

  const stats = [
    { value: time, label: format === 'fortime' ? 'your time' : 'time' },
    { value: kg.toLocaleString('en-US'), label: 'kg moved' },
    { value: p.reps ?? '0', label: 'reps' },
    scoreTile,
  ];

  return (
    <Screen footer={<Button
          label="Save to log"
          onPress={() => {
            add({
              id: `s-${Date.now()}`,
              date: new Date().toISOString(),
              name: p.name ?? 'Workout',
              format,
              bell,
              seconds,
              rounds,
              reps: Number(p.reps ?? 0),
              kg,
              feel,
            });
            router.dismissAll();
          }}
        />}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20 }}>
        <View style={{ gap: 6 }}>
          <Eyebrow color={colors.goText}>Session complete</Eyebrow>
          <Title size={48}>Nice work</Title>
          <Body muted style={{ fontSize: 14 }}>
            {p.name ?? 'Workout'} · {formatLabel(format)} · {today}
          </Body>
        </View>
        <IconButton
          icon="share"
          label="Share"
          onPress={() => Share.share({ message: `Just moved ${kg.toLocaleString('en-US')} kg in ${time} with Kettlebelt.` })}
        />
      </Row>

      <View style={styles.grid}>
        {[stats.slice(0, 2), stats.slice(2)].map((pair, r) => (
          <Row key={r} style={{ gap: 6 }}>
            {pair.map((s) => (
              <View key={s.label} style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Row>
        ))}
      </View>


      {bell ? (
        <View style={styles.nextBell}>
          <Bell kg={nextSize} size={44} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.strong}>
              {feel === 'Easy' ? `Ready for ${nextSize} kg` : `Today: ${bell} kg`}
            </Text>
            <Body muted style={{ fontSize: 12, lineHeight: 17 }}>
              {feel === 'Easy'
                ? heavierOwned
                  ? `That felt easy. Next time, pick your ${nextSize} kg bell for this workout.`
                  : `That felt easy and ${bell} kg is your heaviest bell.`
                : feel === 'Hard'
                  ? 'Stay at this weight until it feels about right.'
                  : 'Mark it “Easy” when it is, and we’ll suggest the next bell.'}
            </Body>
            {feel === 'Easy' && !heavierOwned ? (
              <Pressable accessibilityRole="link">
                <Text style={styles.link}>Browse {nextSize} kg bells · partner shop</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={{ gap: 10 }}>
        <Eyebrow>How did it feel?</Eyebrow>
        <Row>
          {FEEL.map((f) => (
            <Chip key={f} label={f} selected={feel === f} onPress={() => setFeel(f)} />
          ))}
        </Row>
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  grid: { gap: 6 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, gap: 2 },
  statValue: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 36, color: colors.text },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  mono: { fontFamily: fonts.mono, fontSize: 12 },
  strong: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  nextBell: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  link: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.goText },
}),
);
