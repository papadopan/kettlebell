import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Icon } from '@/components/Icon';
import { BackLink, Body, Card, Eyebrow, Row, Screen, Title } from '@/components/ui';
import { dayLabel, sessionDays } from '@/data/stats';
import { formatLabel, getWorkout } from '@/data/workouts';
import { Session, useSessions } from '@/store/sessions';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

/** Older saved sessions can be missing a field, so never render a raw number. */
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const kg = (n: number) => Math.round(num(n)).toLocaleString('en-US');
const mins = (seconds: number) => `${Math.max(0, Math.round(num(seconds) / 60))} min`;
/** "About right" is too long for one row, so the log uses a short form. */
const feelShort = (feel?: string) => (feel === 'About right' ? 'ok' : feel ? feel.toLowerCase() : '');

function SessionRow({ s }: { s: Session }) {
  // Only offer to reopen it if that workout is still around.
  const workout = s.workoutId ? getWorkout(s.workoutId) : undefined;
  const body = (
    <>
      <View style={[styles.pip, { backgroundColor: bellColor(s.bell) }]} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.name} numberOfLines={1}>
          {s.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatLabel(s.format)} · {num(s.bell)} kg · {mins(s.seconds)}
          {s.feel ? ` · ${feelShort(s.feel)}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 3 }}>
        <Text style={styles.value}>{kg(s.kg)} kg</Text>
        <Text style={styles.meta}>{num(s.reps)} reps</Text>
      </View>
      {workout ? <Icon name="chevron" size={16} color={colors.dim} /> : null}
    </>
  );

  if (!workout) return <Row style={styles.row}>{body}</Row>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${s.name}`}
      onPress={() => router.push({ pathname: '/routine', params: { id: workout.id } })}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      {body}
    </Pressable>
  );
}

export default function History() {
  const { sessions, ready } = useSessions();
  const days = sessionDays(sessions);

  return (
    <Screen>
      <BackLink label="Back" />
      <View style={{ gap: 6 }}>
        <Eyebrow color={colors.goText}>Everything you have done</Eyebrow>
        <Title size={44}>History</Title>
      </View>

      {!ready ? null : days.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 14, paddingVertical: 28 }}>
          <Bell color={colors.dim} size={56} filled={false} />
          <Body muted style={{ fontSize: 14 }}>
            Nothing logged yet. Sessions land here the moment you save one.
          </Body>
        </Card>
      ) : (
        days.map((d) => (
          <View key={d.key} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Eyebrow>{dayLabel(d.date)}</Eyebrow>
              <Text style={styles.meta}>
                {kg(d.kg)} kg · {d.minutes} min
              </Text>
            </Row>
            <View style={{ gap: 8 }}>
              {d.sessions.map((s) => (
                <SessionRow key={s.id} s={s} />
              ))}
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface },
    pip: { width: 8, height: 40, borderRadius: 4 },
    name: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
    meta: { fontFamily: fonts.mono, fontSize: 11, color: colors.muted },
    value: { fontFamily: fonts.mono, fontSize: 14, color: colors.text },
  }),
);
