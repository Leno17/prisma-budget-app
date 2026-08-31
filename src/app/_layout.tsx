import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseBootstrap } from '@/providers/database-bootstrap';

export default function RootLayout() {
  return (
    <DatabaseBootstrap>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="setup" />
        <Stack.Screen name="dashboard" options={{ gestureEnabled: false }} />
        <Stack.Screen name="expenses/new" />
        <Stack.Screen name="expenses/[id]" />
        <Stack.Screen name="history" />
        <Stack.Screen name="settings" />
      </Stack>
    </DatabaseBootstrap>
  );
}
