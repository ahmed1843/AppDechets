import { useEffect } from "react";
import { Platform, View } from "react-native";
import { Stack } from 'expo-router';
import NavBar from '../components/NavBar';

export default function RootLayout() {

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Pages qui N'affichent PAS la NavBar
  const HIDE_NAVBAR = ['login', 'register', 'forgot-password'];

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#166534' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '600' },
          // Important : pas d'animation qui cache la NavBar
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index"           options={{ title: "EcoWaste" }} />
        <Stack.Screen name="map"             options={{ title: "Carte des bacs" }} />
        <Stack.Screen name="calendrier"      options={{ title: "Horaires de passage" }} />
        <Stack.Screen name="report"          options={{ title: "Signalement" }} />
        <Stack.Screen name="guide"           options={{ title: "Comment trier ?" }} />
        <Stack.Screen name="points"          options={{ title: "Récompenses" }} />
        <Stack.Screen name="profile"         options={{ title: "Paramètres" }} />
        <Stack.Screen name="driver"          options={{ title: "Chauffeur" }} />
        <Stack.Screen name="historique"      options={{ title: "Historique" }} />
        <Stack.Screen name="login"           options={{ headerShown: false }} />
        <Stack.Screen name="register"        options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="user"            options={{ headerShown: false }} />
        <Stack.Screen name="admin"           options={{ headerShown: false }} />
        <Stack.Screen name="roles"           options={{ headerShown: false }} />
      </Stack>

      {/* NavBar persistante sur toutes les pages sauf login/register */}
      <NavBar />
    </View>
  );
}