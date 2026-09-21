import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Body, Chip, Eyebrow, Title } from '@/components/ui';
import { levelLabel } from '@/data/labels';
import { exerciseName, Group, groupLabel, GROUPS, Workout, workouts } from '@/data/workouts';
import { colors, fonts, space, themedStyles } from '@/theme';

function WorkoutCard({ w }: { w: Workout }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/routine', params: { id: w.id } })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow>{groupLabel(w.group)}</Eyebrow>
        <Text style={styles.meta}>
          {w.minutes} min · {levelLabel(w.level)}
        </Text>
      </View>
      <Text style={styles.name}>{w.name}</Text>
      <Text style={styles.list} numberOfLines={2}>
        {w.items.map((i) => exerciseName(i.exerciseId)).join(' · ')}
      </Text>
    </Pressable>
  );
}

export default function Workouts() {
  const params = useLocalSearchParams<{ group?: Group }>();
  const [group, setGroup] = useState<Group | 'all'>(params.group ?? 'all');

  // Opening this tab from a shortcut on Today selects that body part.
  useEffect(() => {
    if (params.group) setGroup(params.group);
  }, [params.group]);

  const list = group === 'all' ? workouts : workouts.filter((w) => w.group === group);

  const header = (
    <View style={{ gap: 14, paddingBottom: 12 }}>
      <View style={{ gap: 6, paddingTop: 20 }}>
        <Title size={44}>Workouts</Title>
        <Body muted style={{ fontSize: 14 }}>
          Pick a ready-made workout, or build your own.
        </Body>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/generator', params: group === 'all' ? {} : { group } })}
        style={({ pressed }) => [styles.build, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.buildTitle}>Build your own</Text>
          <Text style={styles.buildText}>Choose body part, time and goal. Uses your bells.</Text>
        </View>
        <Icon name="chevron" size={20} color={colors.onGo} />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: space.gutter }}>
        <Chip label="All" selected={group === 'all'} onPress={() => setGroup('all')} />
        {GROUPS.map((g) => (
          <Chip key={g.id} label={g.label} selected={group === g.id} onPress={() => setGroup(g.id)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={list}
        keyExtractor={(w) => w.id}
        renderItem={({ item }) => <WorkoutCard w={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: space.gutter, paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    build: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.go, borderRadius: 16, padding: 16 },
    buildTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.onGo, textTransform: 'uppercase' },
    buildText: { fontFamily: fonts.body, fontSize: 13, color: colors.onGo },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 6 },
    name: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 28, color: colors.text, textTransform: 'uppercase' },
    meta: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
    list: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  }),
);
