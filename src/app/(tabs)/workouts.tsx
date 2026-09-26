import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Body, Chip, Eyebrow, Title } from '@/components/ui';
import { levelLabel } from '@/data/labels';
import { exerciseName, formatLabel, Group, groupLabel, GROUPS, needsPair, Workout, workouts } from '@/data/workouts';
import { useMyWorkouts } from '@/store/myWorkouts';
import { colors, fonts, space, themedStyles } from '@/theme';

function WorkoutCard({ w }: { w: Workout }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/routine', params: { id: w.id } })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow color={w.custom ? colors.goText : colors.muted}>{w.custom ? `Yours · ${groupLabel(w.group)}` : groupLabel(w.group)}</Eyebrow>
        <Text style={styles.meta}>
          {formatLabel(w.format)} · {w.minutes} min · {w.custom ? (needsPair(w) ? '2 bells' : '1 bell') : `${levelLabel(w.level)} · ${needsPair(w) ? '2 bells' : '1 bell'}`}
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
  const { mine } = useMyWorkouts();

  // Opening this tab from a shortcut on Today selects that body part.
  useEffect(() => {
    if (params.group) setGroup(params.group);
  }, [params.group]);

  const all = [...mine, ...workouts];
  const list = group === 'all' ? all : all.filter((w) => w.group === group);

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
          <Text style={styles.buildText}>Pick body part, time and goal — we put it together.</Text>
        </View>
        <Icon name="chevron" size={20} color={colors.onGo} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/builder')}
        style={({ pressed }) => [styles.create, { opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.createTitle}>Create your own workout</Text>
          <Text style={styles.hint}>Choose EMOM or AMRAP, add exercises and save it.</Text>
        </View>
        <Icon name="chevron" size={20} color={colors.text} />
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
    create: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: colors.go },
    createTitle: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.text, textTransform: 'uppercase' },
    hint: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 6 },
    name: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 28, color: colors.text, textTransform: 'uppercase' },
    meta: { fontFamily: fonts.mono, fontSize: 12, color: colors.muted },
    list: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  }),
);
