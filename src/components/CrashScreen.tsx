import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

/**
 * Shown instead of a hard crash when a screen throws.
 * Uses plain system styles on purpose: fonts, theme and providers may be what failed.
 */
export function CrashScreen({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#141719', paddingHorizontal: 22, paddingTop: 80, paddingBottom: 40, gap: 16 }}>
      <Text style={{ color: '#EEF1F2', fontSize: 28, fontWeight: '800' }}>Something went wrong</Text>
      <Text style={{ color: '#A1AAAF', fontSize: 15, lineHeight: 21 }}>
        Kettlebelt hit an error. Please take a screenshot of this screen and send it to us.
      </Text>
      <ScrollView style={{ flex: 1, backgroundColor: '#1E2225', borderRadius: 12 }} contentContainerStyle={{ padding: 14 }}>
        <Text selectable style={{ color: '#F5A524', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
          {error.name}: {error.message}
        </Text>
        <Text selectable style={{ color: '#A1AAAF', fontSize: 11, fontFamily: 'Menlo' }}>
          {(error.stack ?? '').split('\n').slice(0, 14).join('\n')}
        </Text>
      </ScrollView>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => retry()}
        style={{ height: 56, borderRadius: 14, backgroundColor: '#4CBF7F', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#0B1A11', fontSize: 16, fontWeight: '600' }}>Try again</Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={async () => {
          await AsyncStorage.clear().catch(() => {});
          await retry();
        }}
        style={{ height: 48, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#A1AAAF', fontSize: 15 }}>Reset app data and try again</Text>
      </TouchableOpacity>
    </View>
  );
}
