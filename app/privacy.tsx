import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Collecte des données</Text>
        <Text style={styles.text}>Nous collectons uniquement les données nécessaires au fonctionnement de l'application : nom, email, localisation et signalements.</Text>
        <Text style={styles.section}>Utilisation</Text>
        <Text style={styles.text}>Vos données sont utilisées pour vous envoyer des alertes de passage du camion et gérer vos signalements. Elles ne sont jamais vendues à des tiers.</Text>
        <Text style={styles.section}>Suppression</Text>
        <Text style={styles.text}>Vous pouvez demander la suppression de votre compte et données via le support.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  content: { padding: 20 },
  section: { fontSize: 16, fontWeight: '700', color: '#166534', marginTop: 20, marginBottom: 8 },
  text: { fontSize: 14, color: '#64748b', lineHeight: 22 },
});