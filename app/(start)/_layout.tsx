import { Stack } from 'expo-router';
import React from 'react';

export default function StartLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false, // Sembunyikan header default
    }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      {/* Anda bisa menambahkan screen lain di sini jika diperlukan */}
    </Stack>
  );
}