import { useEffect } from "react";
import { Platform, View, Text } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        screenOptions={{
          headerShown: true,
          drawerActiveTintColor: "#166534", // Vert foncé pour l'élément sélectionné
          drawerActiveBackgroundColor: "#f0fdf4", // Fond léger vert
          drawerInactiveTintColor: "#64748b",
          headerTintColor: "#166534",
          drawerStyle: {
            width: 280,
            backgroundColor: "#FFFFFF",
          },
          drawerLabelStyle: {
            marginLeft: -10, // Rapproche le texte de l'icône
            fontWeight: '600',
          }
        }}
      >
        {/* 1. ACCUEIL */}
        <Drawer.Screen
          name="index" 
          options={{
            drawerLabel: "Tableau de bord",
            title: "EcoWaste",
            drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />
          }}
        />

        {/* 2. LA MAP */}
        <Drawer.Screen
          name="map" 
          options={{
            drawerLabel: "Carte des bacs",
            title: "Localisation",
            drawerIcon: ({ color }) => <Ionicons name="map-outline" size={22} color={color} />
          }}
        />

        {/* 3. CALENDRIER */}
        <Drawer.Screen
          name="calendrier" // Assurez-vous que le fichier s'appelle calendar.tsx ou adaptez le name
          options={{
            drawerLabel: "Calendrier de collecte",
            title: "Horaires de passage",
            drawerIcon: ({ color }) => <Ionicons name="calendar-outline" size={22} color={color} />
          }}
        />

        {/* 4. SIGNALER (REPORT) */}
        <Drawer.Screen
          name="report" 
          options={{
            drawerLabel: "Signaler un dépôt",
            title: "Signalement",
            drawerIcon: ({ color }) => <Ionicons name="megaphone-outline" size={22} color={color} />
          }}
        />

        {/* 5. GUIDE DE TRI */}
        <Drawer.Screen
          name="guide" 
          options={{
            drawerLabel: "Guide de tri",
            title: "Comment trier ?",
            drawerIcon: ({ color }) => <Ionicons name="leaf-outline" size={22} color={color} />
          }}
        />

        {/* 6. MES POINTS */}
        <Drawer.Screen
          name="points" 
          options={{
            drawerLabel: "Mes Points",
            title: "Récompenses",
            drawerIcon: ({ color }) => <Ionicons name="ribbon-outline" size={22} color={color} />
          }}
        />

        {/* 7. PROFIL */}
        <Drawer.Screen
          name="profile" 
          options={{
            drawerLabel: "Mon Profil",
            title: "Paramètres",
            drawerIcon: ({ color }) => <Ionicons name="person-circle-outline" size={22} color={color} />
          }}
        />


        {/* --- MASQUER TOUT LE RESTE --- */}
        <Drawer.Screen name="historique" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="user" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="admin" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="roles" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="driver" options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
        <Drawer.Screen name="register" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />

      </Drawer>
    </GestureHandlerRootView>

  );
}
