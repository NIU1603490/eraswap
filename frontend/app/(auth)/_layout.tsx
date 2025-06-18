
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'


export default function AuthLayout() {
    const { isSignedIn } = useAuth()

    // Redirect to the home screen if the user is signed in
    if (isSignedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    // Otherwise, show the signup and login screens
  return <Stack screenOptions={{headerShown: false,}} >
    <Stack.Screen name="signup" options={{ title: "Signup" }} />
    <Stack.Screen name="signin" options={{ title: "SignIn" }} />
    </Stack>;
}