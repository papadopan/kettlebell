import { View } from 'react-native';

import { colors } from '@/theme';
import { Eyebrow } from './ui';

export function Steps({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={{ gap: 10, paddingTop: 16 }}>
      <Eyebrow>
        Step {step} of {total}
      </Eyebrow>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? colors.go : colors.surface2 }} />
        ))}
      </View>
    </View>
  );
}
