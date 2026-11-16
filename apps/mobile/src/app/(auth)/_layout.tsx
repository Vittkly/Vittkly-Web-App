import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="quick-access-prompt" options={{ gestureEnabled: false }} />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="password-updated" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="pin-setup" options={{ gestureEnabled: false }} />
      <Stack.Screen name="biometrics" options={{ gestureEnabled: false }} />
      <Stack.Screen name="pin-lock" options={{ gestureEnabled: false }} />
      <Stack.Screen name="org-selector" />
    </Stack>
  );
}
