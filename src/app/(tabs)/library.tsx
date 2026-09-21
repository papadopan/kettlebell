import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bell } from '@/components/Bell';
import { Icon } from '@/components/Icon';
import { Body, Chip, Title } from '@/components/ui';
import { Exercise, exercises, ExerciseLevel, Pattern, PATTERNS } from '@/data/exercises';
import { levelLabel, patternLabel } from '@/data/labels';
import { colors, fonts, space, themedStyles } from '@/theme';

const LEVELS: { id: ExerciseLevel | 'all'; label: string }[] = [
  { id: 'all', label: 'Any level' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

function Row({ e }: { e: Exercise }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${e.name}, ${patternLabel(e.pattern)}, ${e.level}`}
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={styles.thumb}>
        {e.images[0] ? (
          <Image source={{ uri: e.images[0] }} style={styles.thumbImg} resizeMode="cover" />
        ) : (
          <Bell color={colors.dim} size={26} filled={false} />
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.name} numberOfLines={1}>
          {e.name}
        </Text>
        <Text style={styles.meta}>
          {patternLabel(e.pattern)} · {levelLabel(e.level)}
        </Text>
      </View>
      <Icon name="chevron" size={18} color={colors.dim} />
    </Pressable>
  );
}

export default function Library() {
  const [query, setQuery] = useState('');
  const [pattern, setPattern] = useState<Pattern | 'all'>('all');
  const [level, setLevel] = useState<ExerciseLevel | 'all'>('all');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        (pattern === 'all' || e.pattern === pattern) &&
        (level === 'all' || e.level === level) &&
        (!q || e.name.toLowerCase().includes(q) || [...e.primary, ...e.secondary].some((m) => m.includes(q))),
    );
  }, [query, pattern, level]);

  const header = (
    <View style={{ gap: 14, paddingBottom: 8 }}>
      <View style={{ gap: 6, paddingTop: 20 }}>
        <Title size={44}>Library</Title>
        <Body muted style={{ fontSize: 14 }}>
          {exercises.length} kettlebell exercises. Search by name or muscle.
        </Body>
      </View>
      <View style={styles.search}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search: swing, press, shoulders…"
          placeholderTextColor={colors.dim}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel="Search exercises"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={`All ${exercises.length}`} selected={pattern === 'all'} onPress={() => setPattern('all')} />
        {PATTERNS.map((p) => (
          <Chip
            key={p.id}
            label={`${p.label} ${exercises.filter((e) => e.pattern === p.id).length}`}
            selected={pattern === p.id}
            onPress={() => setPattern(p.id)}
          />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {LEVELS.map((l) => (
          <Chip key={l.id} label={l.label} selected={level === l.id} onPress={() => setLevel(l.id)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <Row e={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={<Body muted>No exercises match. Try another search or filter.</Body>}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { paddingHorizontal: space.gutter, paddingBottom: 24 },
    search: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, height: 48, justifyContent: 'center' },
    searchInput: { fontFamily: fonts.body, fontSize: 15, color: colors.text },
    chips: { gap: 8, paddingRight: space.gutter },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line },
    thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.surface2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    thumbImg: { width: 56, height: 56 },
    name: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
    meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  }),
);
