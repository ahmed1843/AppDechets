import { Tabs } from 'expo-router';
import React from 'react';
// On n'oublie pas d'ajouter Camera ici
import { Camera, Home, Map, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#166534', 
        headerShown: true,
      }}>
      
      {/* 1. L'ACCUEIL */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />

      {/* 2. LE SIGNALEMENT (Fichier explore.tsx) */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Signaler',
          tabBarIcon: ({ color }) => <Camera color={color} size={24} />,
        }}
      />

      {/* 3. LA CARTE (Fichier map.tsx) */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color }) => <Map color={color} size={24} />,
        }}
      />

      {/* 4. LE PROFIL (Fichier two.tsx) */}
      <Tabs.Screen
        name="two"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
