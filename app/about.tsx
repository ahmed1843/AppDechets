import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>À propos</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.content}>
        {/* Zone Logo (Corrigé avec la poubelle verte comme à l'accueil) */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash" size={40} color="#166534" />
          </View>
          <Text style={styles.appName}>SAMA GOX</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Carte d'information */}
        <View style={styles.infoCard}>
          <Text style={styles.descriptionText}>
            Application citoyenne de gestion intelligente des déchets pour la ville de Dakar. 
            Signalez les dépôts sauvages en un clic et recevez des alertes en temps réel avant le passage du camion de collecte.
          </Text>

          {/* Séparateur sans erreur de syntaxe */}
          <View style={styles.divider} />

          <Text style={styles.sectionSubtitle}>Technologies & Origine</Text>
          
          <View style={styles.badgeRow}>
            <View style={[styles.techBadge, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <Ionicons name="logo-react" size={14} color="#1d4ed8" />
              <Text style={[styles.techBadgeText, { color: '#1d4ed8' }]}>React Native</Text>
            </View>
            <View style={[styles.techBadge, { backgroundColor: '#fff5f5', borderColor: '#feb2b2' }]}>
              <Ionicons name="code-slash" size={14} color="#e53e3e" />
              <Text style={[styles.techBadgeText, { color: '#e53e3e' }]}>Laravel API</Text>
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#166534" />
            <Text style={styles.locationText}>Dakar, Sénégal</Text>
          </View>
        </View>

        <Text style={styles.footerText}>© 2026 SAMA GOX · Projet de Fin d'Études</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    ...Platform.select({
      ios: { shadowColor: '#166534', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginTop: 4
  },
  versionBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400'
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    width: '100%',
    marginVertical: 16 // Erreur de propriété résolue ici
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  techBadgeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  locationText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600'
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 16,
    fontWeight: '500'
  }
});