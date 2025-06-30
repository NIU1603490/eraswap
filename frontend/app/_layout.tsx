import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ClerkProvider} from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router'
import AuthSync from './authSync';
 
export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.CLERK_PUBLISHABLE_KEY!}>
        <SafeAreaProvider>
          <AuthSync/>
            <Slot /> 
          <StatusBar />
        </SafeAreaProvider>
    </ClerkProvider>
    
  )
}
