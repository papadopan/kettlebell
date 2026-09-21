import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Body, Screen, tap, Title } from '@/components/ui';
import { allSkills, Branch, branches, Skill, unlockedCount } from '@/data/mock';
import { bellColor, colors, fonts } from '@/theme';

const NOW = bellColor(16);

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
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: NOW }} />
      </View>
    );
  }
  return (
    <View style={[styles.marker, { borderWidth: 2, borderColor: colors.line }]}>
      <Icon name="lock" size={16} color={colors.dim} />
    </View>
  );
}

export default function BellPath() {
  const [branchId, setBranchId] = useState<Branch['id']>('ballistics');
  const branch = branches.find((b) => b.id === branchId) ?? branches[0];

  return (
    <Screen inTabs>
      <View style={{ gap: 6, paddingTop: 20 }}>
        <Title size={44}>Bell Path</Title>
        <Body muted style={{ fontSize: 14 }}>
          {unlockedCount} of {allSkills.length} skills unlocked across {branches.length} branches
        </Body>
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
                <Text style={[styles.meta, s.state === 'now' && { color: NOW }, s.state === 'locked' && { color: colors.dim }]}>
                  {s.state === 'now' ? `Working on it · ${s.meta}` : s.meta}
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

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.surface },
  segItem: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segLabel: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 76 },
  nowRow: { backgroundColor: colors.surface, marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 16 },
  connector: { position: 'absolute', left: 21, top: 60, width: 2, height: 32 },
  marker: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  now: { borderWidth: 3, borderColor: NOW, shadowColor: NOW, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
  name: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.text },
  nowName: { fontFamily: fonts.displayBold, fontSize: 26, lineHeight: 26, color: colors.text, textTransform: 'uppercase' },
  meta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted },
});
