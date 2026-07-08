import { MapPin } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// On crée des variables vides pour le Web
let MapView: any = View; 
let Marker: any = View;

// On n'importe la vraie librairie QUE si on est sur Android ou iOS
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    console.log("Erreur chargement maps mobile:", e);
  }
}

export default function MapScreen() {
  // Affichage pour le navigateur (Web)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
       <MapPin size={64} color="#166534" />
        <Text style={styles.webTitle}>Mode Carte activé</Text>
        <Text style={styles.webText}>
          La carte interactive (Google Maps) est réservée à la version mobile.
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Disponible sur Android / iOS</Text>
        </View>
      </View>
    );
  }

  // Affichage pour le téléphone (Android/iOS)
  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude: 48.8566, longitude: 2.3522 }} title="Bac de tri" />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  webContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 30, 
    backgroundColor: '#f0fdf4' 
  },
  webTitle: { fontSize: 22, fontWeight: 'bold', color: '#166534', marginBottom: 10 },
  webText: { fontSize: 16, color: '#475569', textAlign: 'center', marginBottom: 20 },
  badge: { backgroundColor: '#166534', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});
