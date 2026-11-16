import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { FaceIdIcon } from '@/components/icons';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { tokens, useTheme } from '@/theme';

import { OfflineSessionBanner } from '../components/OfflineSessionBanner';
import { useBiometricSetup } from '../hooks/useBiometricSetup';

const SHEET_HANDLE_WIDTH = tokens.control.md;
const SHEET_HANDLE_HEIGHT = tokens.spacing.space1;
const SHEET_ICON_SIZE = tokens.control.lg;
const FACE_ICON_SIZE = tokens.spacing.space6;

export function BiometricsSetupScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { isActivating, isOffline, handleActivateBiometrics, handleSkipBiometrics } =
    useBiometricSetup();

  return (
    <SafeAreaView
      testID="biometrics-setup-screen"
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
    >
      <OfflineSessionBanner visible={isOffline} />

      <View style={styles.backdrop}>
        <BottomSheet testID="biometrics-bottom-sheet">
          <View
            style={[
              styles.sheetHandle,
              {
                width: SHEET_HANDLE_WIDTH,
                height: SHEET_HANDLE_HEIGHT,
                borderRadius: radius.pill,
                backgroundColor: colors.lineStrong,
                marginBottom: spacing.space2,
              },
            ]}
          />

          <View
            style={[
              styles.sheetIcon,
              {
                width: SHEET_ICON_SIZE,
                height: SHEET_ICON_SIZE,
                borderRadius: radius.pill,
                backgroundColor: colors.primarySoft,
              },
            ]}
          >
            <FaceIdIcon size={FACE_ICON_SIZE} color={colors.primaryInk} />
          </View>

          <Text style={[typography.title2, { color: colors.ink }]}>Activa Face ID o huella</Text>

          <Text style={[typography.body, { color: colors.inkMuted }]}>
            Entra más rápido la próxima vez, incluso sin conexión.
          </Text>

          <View style={[styles.actionsStack, { gap: spacing.space2, marginTop: spacing.space3 }]}>
            <Button
              testID="biometrics-activate-btn"
              variant="inverse"
              shape="pill"
              block
              isLoading={isActivating}
              disabled={isActivating}
              onPress={() => void handleActivateBiometrics()}
            >
              Activar
            </Button>

            <Button
              testID="biometrics-skip-btn"
              variant="ghost"
              shape="pill"
              block
              disabled={isActivating}
              onPress={() => void handleSkipBiometrics()}
            >
              Ahora no
            </Button>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetHandle: {
    alignSelf: 'center',
  },
  sheetIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsStack: {
    width: '100%',
  },
});
