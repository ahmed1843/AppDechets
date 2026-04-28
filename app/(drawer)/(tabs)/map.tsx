import { MapPinned } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.webContainer}>
      <MapPinned size={64} color="#166534" />
      <Text style={styles.webTitle}>Carte (Mode Web)</Text>
      <Text style={styles.webText}>
        L'affichage Google Maps est désactivé sur navigateur pour éviter les erreurs.
      </Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Actif sur Mobile uniquement</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f0fdf4' },
  webTitle: { fontSize: 22, fontWeight: 'bold', color: '#166534', marginBottom: 10 },
  webText: { fontSize: 16, color: '#475569', textAlign: 'center', marginBottom: 20 },
  badge: { backgroundColor: '#166534', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});
