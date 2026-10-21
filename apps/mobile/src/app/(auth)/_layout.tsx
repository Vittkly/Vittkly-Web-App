import { Stack } from 'expo-router';
import React from 'react';

export default function AuthGroupLayout() {
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
      <Stack.Screen name="signup-done" />
      <Stack.Screen name="login_email" />
      <Stack.Screen name="quick-access-prompt" options={{ gestureEnabled: false }} />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="password-updated" />
      <Stack.Screen name="invitation" />
      <Stack.Screen name="invite-welcome" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="pin-setup" options={{ gestureEnabled: false }} />
      <Stack.Screen name="biometrics" options={{ gestureEnabled: false }} />
      <Stack.Screen name="pin-lock" options={{ gestureEnabled: false }} />
      <Stack.Screen name="select-tenant" />
    </Stack>
  );
}
