import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>À propos</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Ionicons name="leaf" size={60} color="#166534" />
        </View>
        <Text style={styles.appName}>SmartWaste</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.description}>Application de gestion intelligente des déchets pour la ville de Dakar. Signalez les dépôts sauvages et recevez les alertes de passage du camion poubelle.</Text>
        <View style={styles.infoRow}>
          <Ionicons name="code-slash-outline" size={18} color="#166534" />
          <Text style={styles.infoText}>Développé avec React Native & Laravel</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#166534" />
          <Text style={styles.infoText}>Dakar, Sénégal</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  content: { flex: 1, alignItems: 'center', padding: 30 },
  logo: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
  version: { fontSize: 14, color: '#94a3b8', marginTop: 4, marginBottom: 20 },
  description: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  infoText: { fontSize: 14, color: '#64748b' },
});