import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bell, KgTag } from '@/components/Bell';
import { Body, Button, Card, Eyebrow, IconButton, ProgressBar, Row, Screen, Title } from '@/components/ui';
import { emom, skillDetails } from '@/data/mock';
import { useBells } from '@/store/bells';
import { colors, fonts } from '@/theme';

const STATS = [
  { value: '3', label: 'sessions this week' },
  { value: '4,210', label: 'kg moved' },
  { value: '12', label: 'day streak' },
];

export default function Today() {
  const { weights } = useBells();
  const clean = skillDetails.clean;

  return (
    <Screen inTabs>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20 }}>
        <View style={{ gap: 6 }}>
          <Eyebrow>Tuesday · week 3</Eyebrow>
          <Title>Good morning</Title>
        </View>
        <IconButton icon="settings" label="Edit my bells" onPress={() => router.push('/onboarding/bells')} />
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
        <Eyebrow color={colors.go}>Suggested for today</Eyebrow>
        <Text style={styles.cardTitle}>EMOM 20 · Strength</Text>
        <Body muted style={{ fontSize: 14 }}>
          20 min · uses your {weights.length ? weights.join(', ') + ' kg' : ''} bells
        </Body>
        <View style={styles.lines}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body style={{ fontSize: 14 }}>Odd min · one-hand swing 5/side</Body>
            <KgTag kg={emom.odd.kg} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <Body style={{ fontSize: 14 }}>Even min · clean 3/side</Body>
            <KgTag kg={emom.even.kg} />
          </Row>
        </View>
        <Row>
          <Button label="Another" variant="secondary" onPress={() => router.push('/generator')} />
          <Button label="Start" onPress={() => router.push({ pathname: '/routine', params: { minutes: '20', goal: 'Strength' } })} />
        </Row>
      </Card>

      <Pressable accessibilityRole="button" onPress={() => router.navigate('/(tabs)/path')}>
        <Card style={{ padding: 16, gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Eyebrow>Bell Path · Ballistics</Eyebrow>
            <Text style={styles.open}>Open</Text>
          </Row>
          <Row style={{ gap: 12 }}>
            <Bell kg={16} size={30} />
            <View>
              <Text style={styles.skill}>Working on: Clean</Text>
              <Body muted style={{ fontSize: 13 }}>
                Best {clean.best} · goal {clean.standard.replace(' each side', '')}
              </Body>
            </View>
          </Row>
          <ProgressBar value={clean.progress} />
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, gap: 2 },
  statValue: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 30, color: colors.text },
  statLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  cardTitle: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, color: colors.text },
  lines: { gap: 8, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  open: { fontFamily: fonts.body, fontSize: 13, color: colors.go },
  skill: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text },
});
