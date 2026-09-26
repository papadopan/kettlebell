import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { tap } from '@/components/ui';
import { colors, fonts, themedStyles } from '@/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Today', icon: 'today' },
  workouts: { label: 'Workouts', icon: 'workouts' },
  library: { label: 'Library', icon: 'library' },
  stats: { label: 'Stats', icon: 'log' },
};

function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === i;
        const c = focused ? colors.text : colors.dim;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            onPress={() => {
              tap();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.item}
          >
            <Icon name={tab.icon} size={22} color={c} />
            <Text style={[styles.label, { color: c }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="stats" />
    </Tabs>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 11 },
}),
);
