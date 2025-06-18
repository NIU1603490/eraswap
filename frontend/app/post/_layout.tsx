import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{headerShown: false,}} >
        <Stack.Screen name="create_post" options={{ title: 'Create Post' }} />
        <Stack.Screen name="modify_post" options={{ title: 'Modify Post' }} />
        
      </Stack>
    </SafeAreaProvider>
  );
}