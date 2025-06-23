// app/(tabs)/purch/_layout.tsx  (ajusta la ruta según tu estructura)
import React from 'react';
import { Slot, Stack } from 'expo-router';

export default function PurchLayout() {
  // Slot renderiza la ruta hija (p.ej. index.tsx dentro de purch/)
  return <Stack screenOptions={{headerShown: false,}} >
  <Stack.Screen name="[id]" options={{ title: "product" }} />
  <Stack.Screen name="manage_purchases" options={{ title: "Manage Purchases" }} />
  <Stack.Screen name="purchase_list" options={{ title: "Purchase List" }} />
  </Stack>;
}
