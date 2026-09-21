import { StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Body, Screen, Title } from '@/components/ui';
import { library } from '@/data/mock';
import { colors, fonts } from '@/theme';

export default function Library() {
  return (
    <Screen inTabs>
      <View style={{ gap: 6, paddingTop: 20 }}>
        <Title size={44}>Library</Title>
        <Body muted style={{ fontSize: 14 }}>
          Example list — photos and instructions from free-exercise-db come next.
        </Body>
      </View>
      <View>
        {library.map((e) => (
          <View key={e.name} style={styles.row}>
            <Bell kg={e.kg} size={26} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{e.name}</Text>
              <Text style={styles.meta}>{e.pattern}</Text>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.line },
  name: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  meta: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
});
