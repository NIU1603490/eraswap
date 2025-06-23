import { Slot, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { View, ActivityIndicator } from 'react-native'

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  if (!isSignedIn) return <Redirect href="/signin" />

  return <Slot />
}
