import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f7f6f2',
          },
          headerTintColor: '#14141a',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#f7f6f2',
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
