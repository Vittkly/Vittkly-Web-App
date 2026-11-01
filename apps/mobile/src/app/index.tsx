import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthRouteGuard } from '@/features/auth';
import { useTheme } from '@/theme';

export default function HomeGate() {
  const { colors } = useTheme();
  const { isLoading, redirectTo } = useAuthRouteGuard();

  if (isLoading) {
    return (
      <View
        testID="index-auth-loading"
        style={[styles.loadingScreen, { backgroundColor: colors.surface }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (redirectTo) {
    return <Redirect href={redirectTo} />;
  }

  return <Redirect href="/(tabs)/hoy" />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
