import { Redirect } from "expo-router"
import { SafeAreaView, View, ActivityIndicator } from "react-native";
import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';

export default function Index() {
  const { isLoaded } = useAuth();

    if (!isLoaded) {
      console.log('index loading')
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

  return (
    <SafeAreaView>
      <SignedIn>
        <Redirect href="/home" />
      </SignedIn>
      <SignedOut>
        <Redirect href="/signup" />
      </SignedOut>
    </SafeAreaView>
  );
}