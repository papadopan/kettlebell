import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Body, Button, Chip, Eyebrow, IconButton, Row, Screen, Title } from '@/components/ui';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

const FEEL = ['Easy', 'About right', 'Hard'];

export default function Summary() {
  const p = useLocalSearchParams<{ name?: string; minutes?: string; rounds?: string; reps?: string; kg?: string; seconds?: string }>();
  const [feel, setFeel] = useState('About right');
  const seconds = Number(p.seconds ?? 0);
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const kg = Number(p.kg ?? 0);
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const stats = [
    { value: time, label: 'time' },
    { value: kg.toLocaleString('en-US'), label: 'kg moved' },
    { value: p.reps ?? '0', label: 'reps' },
    { value: `${p.rounds ?? 0}/${p.minutes ?? 0}`, label: 'rounds' },
  ];

  return (
    <Screen footer={<Button label="Save to log" onPress={() => router.dismissAll()} />}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 20 }}>
        <View style={{ gap: 6 }}>
          <Eyebrow color={colors.goText}>Session complete</Eyebrow>
          <Title size={48}>Nice work</Title>
          <Body muted style={{ fontSize: 14 }}>
            {p.name ?? 'Workout'} · {p.minutes} min · {today}
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


      <View style={styles.nextBell}>
        <Bell kg={24} size={44} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.strong}>Almost ready for 24 kg</Text>
          <Body muted style={{ fontSize: 12, lineHeight: 17 }}>
            Two more sessions at 20 kg and your swings move up. No 24 yet?
          </Body>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>Browse 24 kg bells · partner shop</Text>
          </Pressable>
        </View>
      </View>

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
