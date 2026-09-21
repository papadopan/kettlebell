import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Bell } from '@/components/Bell';
import { Icon } from '@/components/Icon';
import { BackLink, Body, Button, Card, Eyebrow, ProgressBar, Row, Screen, Title } from '@/components/ui';
import { findSkill, skillDetails } from '@/data/mock';
import { bellColor, colors, fonts } from '@/theme';

function PhotoSlot({ label }: { label: string }) {
  return (
    <View style={styles.photo} accessibilityLabel={`${label} photo placeholder`}>
      <Bell color={colors.dim} size={40} filled={false} />
      <Text style={styles.photoLabel}>{label}</Text>
    </View>
  );
}

export default function SkillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = findSkill(id ?? '');
  const detail = id ? skillDetails[id] : undefined;

  if (!found) {
    return (
      <Screen>
        <BackLink label="Bell Path" />
        <Title>Skill not found</Title>
      </Screen>
    );
  }

  const { branch, skill, index } = found;
  const accent = detail ? bellColor(detail.kg) : colors.go;

  return (
    <Screen
      footer={
        <Row>
          <Button label="Watch demo" variant="secondary" />
          <Button label="Practice now" onPress={() => router.push({ pathname: '/workout', params: { minutes: '10' } })} />
        </Row>
      }
    >
      <BackLink label="Bell Path" />
      <Row>
        <PhotoSlot label="Start position" />
        <PhotoSlot label="Finish position" />
      </Row>
      <View style={{ gap: 6 }}>
        <Eyebrow>
          {branch.name} · step {index + 1} of {branch.skills.length}
        </Eyebrow>
        <Title size={52}>{skill.name}</Title>
      </View>

      {detail ? (
        <>
          <Card style={{ padding: 16, gap: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={styles.label}>To unlock</Text>
              <Text style={styles.mono}>
                {detail.standard} · {detail.kg} kg
              </Text>
            </Row>
            <ProgressBar value={detail.progress} color={accent} />
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={styles.label}>Your best</Text>
              <Text style={styles.mono}>{detail.best}</Text>
            </Row>
            <Row style={styles.needs}>
              <Icon name="check" size={16} color={colors.go} strokeWidth={2.5} />
              <Text style={styles.label}>Needs {detail.needs.toLowerCase()} — unlocked</Text>
            </Row>
          </Card>
          <View style={{ gap: 10 }}>
            <Eyebrow>Coaching cues</Eyebrow>
            {detail.cues.map((c, i) => (
              <Row key={c} style={{ alignItems: 'flex-start', gap: 10 }}>
                <Text style={[styles.mono, { color: accent }]}>0{i + 1}</Text>
                <Body style={{ flex: 1, fontSize: 14 }}>{c}</Body>
              </Row>
            ))}
          </View>
        </>
      ) : (
        <Card>
          <Body muted>{skill.state === 'done' ? 'Unlocked. Keep it in your routines to stay sharp.' : skill.meta}</Body>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { flex: 1, height: 190, borderRadius: 14, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.dim },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  mono: { fontFamily: fonts.mono, fontSize: 14, color: colors.text },
  needs: { paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
});
