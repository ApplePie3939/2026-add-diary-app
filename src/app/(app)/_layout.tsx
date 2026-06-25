import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';

import { useAuth } from '../../store/auth';
import { EntriesProvider } from '../../store/entries';

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]);

  if (!user) return null;

  return (
    <EntriesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="[id]/index" />
        <Stack.Screen name="[id]/edit" options={{ presentation: 'modal' }} />
      </Stack>
    </EntriesProvider>
  );
}
