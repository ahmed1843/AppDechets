
// app/_layout.tsx
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";


export default function RootLayout() {
  useEffect(() => {
    // Demander la permission pour les notifications web
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  return <Stack />;
}