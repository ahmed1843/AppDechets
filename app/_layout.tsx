import { Stack } from 'expo-router';
import { useEffect } from "react";
import { Platform, View } from "react-native";
import * as SplashScreen from 'expo-splash-screen'; // ✅ 1. import
import NavBar from '../components/NavBar';

SplashScreen.preventAutoHideAsync(); // ✅ 2. empêche le splash de se cacher tout seul

export default function RootLayout() {

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
    SplashScreen.hideAsync(); // ✅ 3. cache le splash une fois le layout monté
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
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ title: "SAMA GOX", headerShown: false }} />
        <Stack.Screen name="map"             options={{ title: "Carte des bacs" }} />
        <Stack.Screen name="calendrier"      options={{ title: "Horaires de passage" }} />
        <Stack.Screen name="report"          options={{ title: "Signalement" }} />
        <Stack.Screen name="guide"           options={{ title: "Comment trier ?" }} />
        <Stack.Screen name="points"          options={{ title: "Récompenses" }} />
        <Stack.Screen name="profile"         options={{ title: "Paramètres" }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="support"       options={{ headerShown: false }} />
        <Stack.Screen name="privacy"       options={{ headerShown: false }} />
        <Stack.Screen name="about"         options={{ headerShown: false }} />
        <Stack.Screen name="driver" options={{ headerShown: false }} />
        <Stack.Screen name="historique"      options={{ title: "Historique" }} />
        <Stack.Screen name="login"           options={{ headerShown: false }} />
        <Stack.Screen name="register"        options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="user"            options={{ headerShown: false }} />
        <Stack.Screen name="admin"           options={{ headerShown: false }} />
        <Stack.Screen name="roles"           options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
      </Stack>

      {/* NavBar persistante sur toutes les pages sauf login/register */}
      <NavBar />
    </View>
  );
}