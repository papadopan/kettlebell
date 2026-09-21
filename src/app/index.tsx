import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useBells } from '@/store/bells';
import { colors } from '@/theme';

export default function Index() {
  const { ready, onboarded } = useBells();
  // Wait for the saved profile so returning users skip onboarding.
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
