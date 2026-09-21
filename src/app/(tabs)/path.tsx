import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Body, Screen, tap, Title } from '@/components/ui';
import { allSkills, Branch, branches, Skill, unlockedCount } from '@/data/mock';
import { bellColor, colors, fonts, themedStyles } from '@/theme';

/** Colour for the step you're working on (read at render so it follows the theme). */
const now = () => bellColor(16);

function Marker({ state }: { state: Skill['state'] }) {
  if (state === 'done') {
    return (
      <View style={[styles.marker, { backgroundColor: colors.go }]}>
        <Icon name="check" size={20} color={colors.onGo} strokeWidth={3} />
      </View>
    );
  }
  if (state === 'now') {
    return (
      <View style={[styles.marker, styles.now]}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: now() }} />
      </View>
    );
  }
  return (
    <View style={[styles.marker, { borderWidth: 2, borderColor: colors.line }]}>
      <Icon name="lock" size={16} color={colors.dim} />
    </View>
  );
}

const doneIn = (b: Branch) => `${b.skills.filter((x) => x.state === 'done').length} of ${b.skills.length}`;

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

export default function BellPath() {
  const [branchId, setBranchId] = useState<Branch['id']>('ballistics');
  const branch = branches.find((b) => b.id === branchId) ?? branches[0];

  return (
    <Screen inTabs>
      <View style={{ gap: 8, paddingTop: 20 }}>
        <Title size={44}>Bell Path</Title>
        <Body muted style={{ fontSize: 14, lineHeight: 20 }}>
          Your kettlebell skill tree. Each branch is a series of steps toward one big lift. Hit a step’s standard to
          unlock the next one — your routines only use what you’ve unlocked.
        </Body>
        <Text style={styles.total}>
          {unlockedCount} of {allSkills.length} steps unlocked
        </Text>
      </View>

      <View style={styles.segment} accessibilityRole="tablist">
        {branches.map((b) => {
          const on = b.id === branchId;
          return (
            <Pressable
              key={b.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                tap();
                setBranchId(b.id);
              }}
              style={[styles.segItem, on && { backgroundColor: colors.surface2 }]}
            >
              <Text style={[styles.segLabel, on && { color: colors.text, fontFamily: fonts.bodySemi }]}>{b.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.branchCard}>
        <Text style={styles.branchGoal}>Goal: {branch.goal}</Text>
        <Body muted style={{ fontSize: 13, lineHeight: 18 }}>
          {branch.about}
        </Body>
        <View style={styles.legend}>
          <Legend color={colors.go} label={`${doneIn(branch)} unlocked`} />
          <Legend color={now()} label="Working on" />
          <Legend color={colors.line} label="Locked" />
        </View>
      </View>

      <View>
        {branch.skills.map((s, i) => {
          const last = i === branch.skills.length - 1;
          const content = (
            <>
              {!last ? (
                <View style={[styles.connector, { left: s.state === 'now' ? 33 : 21, backgroundColor: s.state === 'done' ? colors.go : colors.line }]} />
              ) : null}
              <Marker state={s.state} />
              <View style={{ flex: 1, gap: 3 }}>
                {s.state === 'now' ? (
                  <Text style={styles.nowName}>{s.name}</Text>
                ) : (
                  <Text style={[styles.name, s.state === 'locked' && { color: colors.dim }]}>{s.name}</Text>
                )}
                <Text style={[styles.meta, s.state === 'now' && { color: now() }, s.state === 'locked' && { color: colors.dim }]}>
                  {s.state === 'now' ? `Working on it · ${s.meta}` : s.state === 'locked' ? `Locked · ${s.meta.toLowerCase()}` : s.meta}
                </Text>
              </View>
              {s.state === 'now' ? <Icon name="chevron" size={18} color={colors.muted} /> : null}
            </>
          );
          if (s.state === 'locked') {
            return (
              <View key={s.id} style={styles.row}>
                {content}
              </View>
            );
          }
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/skill/[id]', params: { id: s.id } })}
              style={[styles.row, s.state === 'now' && styles.nowRow]}
            >
              {content}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
  total: { fontFamily: fonts.monoMedium, fontSize: 12, color: colors.goText, letterSpacing: 0.6, textTransform: 'uppercase' },
  branchCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 6 },
  branchGoal: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.text, textTransform: 'uppercase' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 4 },
  legendText: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.surface },
  segItem: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 76 },
  nowRow: { backgroundColor: colors.surface, marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 16 },
  connector: { position: 'absolute', left: 21, top: 60, width: 2, height: 32 },
  marker: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  now: { borderWidth: 3, borderColor: now(), shadowColor: now(), shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  name: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  nowName: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 26, color: colors.text, textTransform: 'uppercase' },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
}),
);
