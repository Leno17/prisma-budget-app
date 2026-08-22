import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { DatabaseBootstrap } from '@/providers/database-bootstrap';

export default function RootLayout() {
  return (
    <DatabaseBootstrap>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
      </Stack>
    </DatabaseBootstrap>
  );
}
