import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { useTheme } from '@/theme';

import { useAuth } from '../hooks/useAuth';
import { OfflineSessionBanner } from './OfflineSessionBanner';

export interface AuthScreenLayoutProps {
  children: React.ReactNode;
  onBackPress?: () => void;
  backButtonTestID?: string;
  testID?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  headerRightSlot?: React.ReactNode;
  scrollable?: boolean;
}

export function AuthScreenLayout({
  children,
  onBackPress,
  backButtonTestID = 'auth-back-btn',
  testID,
  contentContainerStyle,
  style,
  headerRightSlot,
  scrollable = true,
}: AuthScreenLayoutProps) {
  const { colors, spacing } = useTheme();
  const { isOffline } = useAuth();

  const renderTopBar = () => {
    if (!onBackPress && !headerRightSlot) return null;

    return (
      <View style={[styles.topBar, { marginBottom: spacing.space4 }]}>
        {onBackPress ? (
          <BackButton onPress={onBackPress} testID={backButtonTestID} />
        ) : (
          <View style={styles.emptySlot} />
        )}
        {headerRightSlot ?? <View style={styles.emptySlot} />}
      </View>
    );
  };

  const bodyContent = (
    <>
      {renderTopBar()}
      {children}
    </>
  );

  return (
    <SafeAreaView
      testID={testID}
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }, style]}
    >
      <OfflineSessionBanner visible={isOffline} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {scrollable ? (
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal: spacing.space6,
                paddingVertical: spacing.space6,
              },
              contentContainerStyle,
            ]}
          >
            {bodyContent}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.staticContent,
              {
                paddingHorizontal: spacing.space6,
                paddingVertical: spacing.space6,
              },
              contentContainerStyle,
            ]}
          >
            {bodyContent}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  emptySlot: {
    width: 40,
    height: 40,
  },
});
