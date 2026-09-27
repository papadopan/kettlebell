import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { tap } from '@/components/ui';
import { colors, fonts, themedStyles } from '@/theme';

type Tab = { name: string; label: string; icon: IconName; sf: string; material: string };

const TABS: Tab[] = [
  { name: 'index', label: 'Today', icon: 'today', sf: 'house.fill', material: 'home' },
  { name: 'workouts', label: 'Workouts', icon: 'workouts', sf: 'list.bullet', material: 'list' },
  { name: 'library', label: 'Library', icon: 'library', sf: 'books.vertical.fill', material: 'menu_book' },
  { name: 'stats', label: 'Stats', icon: 'log', sf: 'chart.bar.fill', material: 'bar_chart' },
];

/** iOS and Android draw their own tab bar; on iOS 26 that means the liquid-glass one. */
function NativeTabsLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.bg}
      tintColor={colors.go}
      iconColor={colors.dim}
      labelStyle={{ color: colors.dim, fontFamily: fonts.bodyMedium }}
      indicatorColor={colors.surface2}
      rippleColor={colors.surface2}
    >
      {TABS.map((t) => (
        <NativeTabs.Trigger key={t.name} name={t.name}>
          <NativeTabs.Trigger.Label>{t.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={t.sf as never} drawable={t.material} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}

/** Web keeps our own bar, so the browser build looks like the app. */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, i) => {
        const tab = TABS.find((t) => t.name === route.name);
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

function JsTabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} />
      ))}
    </Tabs>
  );
}

export default function TabsLayout() {
  return Platform.OS === 'web' ? <JsTabsLayout /> : <NativeTabsLayout />;
}

const styles = themedStyles(() =>
  StyleSheet.create({
    bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg, paddingTop: 8 },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 48 },
    label: { fontFamily: fonts.bodyMedium, fontSize: 11 },
  }),
);
