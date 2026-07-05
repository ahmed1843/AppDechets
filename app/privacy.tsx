import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec bouton retour cohérent */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité</Text>
        <View style={{ width: 34 }} /> {/* Équilibreur visuel */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: Collecte des données */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="server-outline" size={20} color="#0284c7" />
            </View>
            <Text style={styles.cardTitle}>Collecte des données</Text>
          </View>
          <Text style={styles.cardText}>
            Nous collectons uniquement les données nécessaires au bon fonctionnement de l'application : 
            nom, email, localisation et signalements.
          </Text>
        </View>

        {/* Section 2: Utilisation */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#166534" />
            </View>
            <Text style={styles.cardTitle}>Utilisation</Text>
          </View>
          <Text style={styles.cardText}>
            Vos données sont utilisées pour vous envoyer des alertes de passage du camion et gérer vos 
            signalements. Elles ne sont jamais vendues à des tiers.
          </Text>
        </View>

        {/* Section 3: Suppression */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </View>
            <Text style={styles.cardTitle}>Suppression</Text>
          </View>
          <Text style={styles.cardText}>
            Vous pouvez demander la suppression définitive de votre compte et de l'ensemble de vos données associées à tout moment.
          </Text>
          
          {/* Bouton d'action UX vers le support */}
          <TouchableOpacity 
            style={styles.supportButton} 
            onPress={() => router.push('/support')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#166534" />
            <Text style={styles.supportButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' // Fond de page moderne identique au profil
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  backBtn: { 
    padding: 6, 
    backgroundColor: '#f1f5f9', 
    borderRadius: 10 
  },
  title: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#0f172a' 
  },
  scrollContent: {
    padding: 16,
    gap: 14
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    fontWeight: '400'
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  supportButtonText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600'
  }
});