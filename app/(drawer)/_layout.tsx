import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// --- IMPORTS ESSENTIELS ---
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { Camera, Leaf, Map, Settings } from 'lucide-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Composant pour l'en-tête du menu (Profil)
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.userCircle}>
           <Text style={styles.userInitial}>M</Text>
        </View>
        <Text style={styles.userName}>Moussa Diop</Text>
        <Text style={styles.userEmail}>moussa.diop@ecowaste.com</Text>
      </View>
      <View style={styles.drawerDivider} />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer 
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerShown: false, 
          drawerActiveTintColor: '#166534',
          drawerLabelStyle: { marginLeft: 0 }, 
          drawerStyle: { width: 300 },
        }}
      >
        <Drawer.Screen
          name="(tabs)" 
          options={{
            drawerLabel: 'Tableau de bord',
            drawerIcon: ({ color }) => <Leaf size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="signaler" 
          options={{
            drawerLabel: 'Signaler un déchet',
            drawerIcon: ({ color }) => <Camera size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="carte" 
          options={{
            drawerLabel: 'Points de collecte',
            drawerIcon: ({ color }) => <Map size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings" 
          options={{
            drawerLabel: 'Paramètres',
            drawerIcon: ({ color }) => <Settings size={22} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    marginBottom: 10,
  },
  userCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 3,
  },
  userInitial: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { fontSize: 12, color: '#64748b' },
  drawerDivider: { height: 1, backgroundColor: '#e2e8f0', marginHorizontal: 20, marginBottom: 10 },
});
