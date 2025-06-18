import { Redirect } from "expo-router"
import { SafeAreaView, View, ActivityIndicator } from "react-native";
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-expo'
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  // Handle Clerk loading state
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
      {/* {isSignedIn ? (
        <Redirect href="/(tabs)/home" />
      ) : (
        <Redirect href="/(auth)/signup" />
      )} */}
    </SafeAreaView>
  );
}