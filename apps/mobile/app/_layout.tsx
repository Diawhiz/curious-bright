import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#121212',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Curious Bright' }} />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="submit" options={{ title: 'Submit Document' }} />
        <Stack.Screen name="read/[id]" options={{ title: 'Read Document' }} />
        <Stack.Screen name="moderate" options={{ title: 'Moderation' }} />
      </Stack>
    </>
  );
}
