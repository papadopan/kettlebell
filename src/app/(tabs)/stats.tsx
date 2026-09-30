import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Body, Button, Card, Eyebrow, Row, Screen, Title } from '@/components/ui';
import { bellUse, bests, daysAgo, weeks, weekStreak } from '@/data/stats';
import { useSessions } from '@/store/sessions';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

const kg = (n: number) => n.toLocaleString('en-US');
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const mmss = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/**
 * Weekly volume. One series, so there is no legend and only the newest week with
 * work in it carries a value label. A week with nothing in it draws a hairline on
 * the baseline rather than a coloured bar, so empty never reads as "the highlight".
 */
function WeeklyBars({ data }: { data: { label: string; kg: number; sessions: number }[] }) {
  const withWork = data.filter((w) => w.kg > 0);
  const max = Math.max(...data.map((w) => w.kg), 1);
  const peak = Math.max(...data.map((w) => w.kg), 0);
  const newestWithWork = data.reduce((found, w, i) => (w.kg > 0 ? i : found), -1);

  // Nothing in eight weeks: an empty plot is unreadable, so say so instead of drawing it.
  if (!withWork.length) {
    return (
      <View style={styles.chartEmpty}>
        <Text style={styles.emptyLine}>No weight logged in the last 8 weeks.</Text>
        <Text style={styles.caption}>
          Finish a workout and tap “Save to log” — the bars fill in from the kilograms you move.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={styles.caption}>Kilograms moved per week</Text>
        <Text style={styles.caption}>peak {kg(peak)}</Text>
      </Row>
      <View style={styles.chart}>
        {data.map((w, i) => {
          const highlight = i === newestWithWork;
          const empty = w.kg <= 0;
          return (
            <View key={w.label} style={styles.col}>
              {highlight ? <Text style={styles.barValue}>{kg(w.kg)}</Text> : null}
              <View
                accessibilityLabel={`Week of ${w.label}: ${kg(w.kg)} kilograms over ${w.sessions} sessions`}
                style={[
                  styles.bar,
                  {
                    height: empty ? 2 : Math.max(6, (w.kg / max) * 108),
                    backgroundColor: empty ? colors.line : highlight ? colors.go : colors.surface2,
                  },
                ]}
              />
              <Text style={[styles.barLabel, highlight && { color: colors.muted }]}>{w.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.baseline} />
      <Text style={styles.caption}>
        Last {data.length} weeks · {withWork.length} with a session in
      </Text>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function Stats() {
  const { sessions, ready } = useSessions();

  // Wait for the saved sessions before deciding what to show.
  if (!ready) {
    return (
      <Screen inTabs>
        <View style={{ gap: 6, paddingTop: 20 }}>
          <Title size={44}>Stats</Title>
        </View>
      </Screen>
    );
  }

  if (sessions.length === 0) {
    return (
      <Screen inTabs>
        <View style={{ gap: 6, paddingTop: 20 }}>
          <Title size={44}>Stats</Title>
          <Body muted style={{ fontSize: 14 }}>
            Finish a workout and tap “Save to log”. Weight moved, streaks and personal bests show up here.
          </Body>
        </View>
        <Card style={{ alignItems: 'center', gap: 14, paddingVertical: 28 }}>
          <Bell color={colors.dim} size={56} filled={false} />
          <Body muted style={{ fontSize: 14 }}>
            No sessions yet.
          </Body>
          <Button label="Find a workout" onPress={() => router.navigate('/(tabs)/workouts')} style={{ flexGrow: 0, paddingHorizontal: 28 }} />
        </Card>
      </Screen>
    );
  }

  const series = weeks(sessions, 8);
  const thisWeek = series[series.length - 1];
  const lastWeek = series[series.length - 2];
  const change = lastWeek?.kg ? Math.round(((thisWeek.kg - lastWeek.kg) / lastWeek.kg) * 100) : undefined;
  const best = bests(sessions);
  const bells = bellUse(sessions);
  const streak = weekStreak(sessions);
  const last = sessions[0];

  return (
    <Screen inTabs>
      <View style={{ gap: 6, paddingTop: 20 }}>
        <Title size={44}>Stats</Title>
        <Body muted style={{ fontSize: 14 }}>
          {sessions.length} session{sessions.length === 1 ? '' : 's'} · last one{' '}
          {daysAgo(last.date) === 0 ? 'today' : `${daysAgo(last.date)} days ago`}
        </Body>
      </View>

      <Card style={{ gap: 6 }}>
        <Eyebrow color={colors.goText}>This week</Eyebrow>
        <Row style={{ alignItems: 'baseline', gap: 10 }}>
          <Text style={styles.hero}>{kg(thisWeek.kg)}</Text>
          <Text style={styles.heroUnit}>kg moved</Text>
        </Row>
        <Body muted style={{ fontSize: 13 }}>
          {thisWeek.sessions} session{thisWeek.sessions === 1 ? '' : 's'} · {thisWeek.minutes} min
          {change !== undefined ? ` · ${change >= 0 ? '+' : ''}${change}% vs last week` : ''}
        </Body>
      </Card>

      <Card>
        <Eyebrow>Volume</Eyebrow>
        <WeeklyBars data={series} />
      </Card>

      <Row style={{ alignItems: 'stretch' }}>
        <Stat value={`${streak}`} label={`week${streak === 1 ? '' : 's'} in a row`} />
        <Stat value={kg(best?.totalKg ?? 0)} label="kg all time" />
        <Stat value={`${best?.totalMinutes ?? 0}`} label="minutes trained" />
      </Row>

      <Card style={{ gap: 12 }}>
        <Eyebrow>Personal bests</Eyebrow>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body style={{ fontSize: 14 }}>Heaviest bell</Body>
          <Row style={{ gap: 8 }}>
            <Bell kg={best?.heaviestBell ?? 0} size={18} />
            <Text style={styles.value}>{best?.heaviestBell} kg</Text>
          </Row>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body style={{ fontSize: 14 }}>Most in one session</Body>
          <Text style={styles.value}>{kg(best?.biggestSession.kg ?? 0)} kg</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body style={{ fontSize: 14 }}>Longest session</Body>
          <Text style={styles.value}>{mmss(best?.longestSession.seconds ?? 0)}</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body style={{ fontSize: 14 }}>Most rounds</Body>
          <Text style={styles.value}>{best?.mostRounds.rounds}</Text>
        </Row>
      </Card>

      <Card style={{ gap: 10 }}>
        <Eyebrow>Bells used</Eyebrow>
        {bells.map((b) => {
          const share = b.count / Math.max(...bells.map((x) => x.count));
          return (
            <Row key={b.kg} style={{ gap: 10 }}>
              <Text style={[styles.value, { width: 52 }]}>{b.kg} kg</Text>
              <View style={{ flex: 1 }}>
                <View
                  accessibilityLabel={`${b.kg} kilograms used in ${b.count} sessions`}
                  style={{ height: 12, borderRadius: 6, width: `${Math.max(6, share * 100)}%`, backgroundColor: bellColor(b.kg) }}
                />
              </View>
              <Text style={styles.caption}>
                {b.count} session{b.count === 1 ? '' : 's'}
              </Text>
            </Row>
          );
        })}
      </Card>

      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Eyebrow>Recent sessions</Eyebrow>
          <Text style={styles.caption}>{sessions.length} in total</Text>
        </Row>
        {sessions.slice(0, 5).map((s) => (
          <Row key={s.id} style={{ justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.value} numberOfLines={1}>
                {s.name}
              </Text>
              <Text style={styles.caption}>
                {shortDate(s.date)} · {s.bell} kg · {Math.round(s.seconds / 60)} min
              </Text>
            </View>
            <Text style={styles.value}>{kg(s.kg)} kg</Text>
          </Row>
        ))}
        <Button label="See every session" variant="secondary" height={44} onPress={() => router.push('/history')} />
      </Card>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    hero: { fontFamily: fonts.display, fontSize: 56, lineHeight: 58, color: colors.text, fontVariant: ['tabular-nums'] },
    heroUnit: { fontFamily: fonts.body, fontSize: 15, color: colors.muted },
    chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 150, paddingTop: 14 },
    chartEmpty: { gap: 6, paddingVertical: 18 },
    emptyLine: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
    baseline: { height: 1, backgroundColor: colors.line, marginTop: -8 },
    col: { flex: 1, alignItems: 'center', gap: 6 },
    bar: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
    barValue: { fontFamily: fonts.mono, fontSize: 10, color: colors.muted },
    barLabel: { fontFamily: fonts.mono, fontSize: 10, color: colors.dim },
    caption: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, gap: 2 },
    statValue: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 28, color: colors.text },
    statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
    value: { fontFamily: fonts.mono, fontSize: 14, color: colors.text },
  }),
);
