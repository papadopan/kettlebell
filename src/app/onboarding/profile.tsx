import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Steps } from '@/components/Steps';
import { BackLink, Body, Button, Chip, Eyebrow, Screen, tap, Title } from '@/components/ui';
import { Level, useBells } from '@/store/bells';
import { colors, fonts, themedStyles } from '@/theme';

const LEVELS: { id: Level; title: string; text: string }[] = [
  { id: 'new', title: 'New to kettlebells', text: 'Start with swings, squats and deadlifts.' },
  { id: 'some', title: 'I know the basics', text: 'Swings and squats are fine; I want more variety.' },
  { id: 'experienced', title: 'Experienced', text: 'Clean, press and snatch are already in my toolbox.' },
];

export default function Profile() {
  const { level, setLevel, daysPerWeek, setDaysPerWeek, finishOnboarding } = useBells();

  const done = () => {
    finishOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <Screen footer={<Button label="Build my plan" onPress={done} />}>
      <BackLink label="Bells" />
      <Steps step={3} />
      <View style={{ gap: 10 }}>
        <Title size={44}>What’s your level?</Title>
        <Body muted>We use this to suggest workouts at the right level. You can change it later.</Body>
      </View>

      <View style={{ gap: 10 }}>
        {LEVELS.map((l) => {
          const on = level === l.id;
          return (
            <Pressable
              key={l.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => {
                tap();
                setLevel(l.id);
              }}
              style={[styles.option, { borderColor: on ? colors.go : colors.surface2 }]}
            >
              <View style={[styles.radio, { borderColor: on ? colors.go : colors.line }]}>
                {on ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.optionTitle, !on && { color: colors.muted }]}>{l.title}</Text>
                <Text style={styles.optionText}>{l.text}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        <Eyebrow>Days per week</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[2, 3, 4, 5].map((d) => (
            <Chip key={d} label={`${d} days`} selected={daysPerWeek === d} onPress={() => setDaysPerWeek(d)} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 2, backgroundColor: colors.surface },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.go },
  optionTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.text },
  optionText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
}),
);
