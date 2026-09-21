import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Icon, IconName } from '@/components/Icon';
import { Steps } from '@/components/Steps';
import { Body, Button, Eyebrow, Screen, Title } from '@/components/ui';
import { colors, fonts, themedStyles } from '@/theme';

const POINTS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'today', title: 'Build your own', text: 'Choose time and goal; every workout uses the bells you own.' },
  { icon: 'workouts', title: 'Ready-made workouts', text: 'Pick one by body part: arms, chest, back, core or legs.' },
  { icon: 'log', title: 'Your log, free forever', text: 'Every rep and kilo saved. Works offline on the gym floor.' },
];

export default function Welcome() {
  return (
    <Screen footer={<Button label="Get started" onPress={() => router.push('/onboarding/bells')} />}>
      <Steps step={1} />
      <View style={styles.hero}>
        {[12, 16, 20, 24].map((kg, i) => (
          <View key={kg} style={{ transform: [{ translateY: i % 2 ? 10 : 0 }] }}>
            <Bell kg={kg} size={52} />
          </View>
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Eyebrow color={colors.goText}>Welcome to Kettlebelt</Eyebrow>
        <Title size={46}>Train the bell, not the feed</Title>
        <Body muted>Three quick questions and we’ll build your first routine.</Body>
      </View>
      <View style={{ gap: 14 }}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.iconWrap}>
              <Icon name={p.icon} size={20} color={colors.go} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointText}>{p.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  hero: { flexDirection: 'row', justifyContent: 'center', gap: 14, paddingVertical: 12 },
  point: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  pointTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.text },
  pointText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
}),
);
