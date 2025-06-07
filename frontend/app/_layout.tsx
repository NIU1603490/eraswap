import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { ClerkProvider} from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router'
import { ProductProvider } from "../contexts/productContext";
import { TransactionProvider } from "@/contexts/transactionContext";



export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ProductProvider>
        <TransactionProvider>
          <SafeAreaProvider>
            <Slot /> 
          <StatusBar style='dark' />
          </SafeAreaProvider>
        </TransactionProvider>
      </ProductProvider>
    </ClerkProvider>
    
  )
}
