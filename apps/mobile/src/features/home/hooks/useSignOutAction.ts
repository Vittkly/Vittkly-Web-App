import { router } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/features/auth';

export function useSignOutAction() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, handleSignOut };
}
