import { StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Body, Button, Card, Eyebrow, Screen, Title } from '@/components/ui';
import { useBells } from '@/store/bells';
import { recentSessions } from '@/data/mock';
import { colors, fonts, themedStyles } from '@/theme';

export default function Log() {
  const { reset } = useBells();
  return (
    <Screen inTabs>
      <View style={{ gap: 6, paddingTop: 20 }}>
        <Title size={44}>Log</Title>
        <Body muted style={{ fontSize: 14 }}>
          Your training history is free, forever.
        </Body>
      </View>
      {recentSessions.map((s) => (
        <Card key={s.date} style={{ gap: 6 }}>
          <Eyebrow>{s.date}</Eyebrow>
          <Text style={styles.title}>{s.title}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Text style={styles.meta}>{s.minutes} min</Text>
            <Text style={styles.meta}>{s.kg.toLocaleString('en-US')} kg moved</Text>
          </View>
        </Card>
      ))}
      {__DEV__ ? (
        <Button
          label="Reset onboarding (dev only)"
          variant="ghost"
          height={44}
          onPress={() => {
            reset();
            router.replace('/onboarding');
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  title: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.text },
  meta: { fontFamily: fonts.mono, fontSize: 13, color: colors.muted },
}),
);
