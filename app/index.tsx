import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Switch,
  Platform,
  RefreshControl
} from "react-native";
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics'; // Pour l'effet de vibration
import { registerForPushNotificationsAsync, savePushToken } from '../services/notifications';
import API_URL from "../services/api";

export default function HomeScreen() {
  const router = useRouter();
  
  // --- ÉTATS (STATES) ---
  const [userName, setUserName] = useState("Citoyen");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [street, setStreet] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const streetRef = useRef<string | null>(null);

  // --- LOGIQUE DE CHARGEMENT ---
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.name) setUserName(data.name.split(' ')[0]);
      if (data.street) {
        setStreet(data.street);
        streetRef.current = data.street;
      }
    } catch (error) {
      console.log("Erreur chargement profil:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData(); // On recharge les infos de la rue et du nom
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadUserData();

    // Polling du camion
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/check-alerte`);
        const data = await response.json();
        const zoneNormalisee = data.zone?.trim().toLowerCase();
        const streetNormalisee = streetRef.current?.trim().toLowerCase();

        if (data.actif && zoneNormalisee === streetNormalisee) {
          setIsCollecting(true);
        } else if (!data.actif) {
          setIsCollecting(false);
        }
      } catch (error) {
        console.log("Erreur polling:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const handleQuickReport = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/report");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#166534']} />
        }
      >
        
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
            {street && <Text style={styles.streetText}>📍 {street}</Text>}
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/profile")}>
            <View style={styles.profileInitial}>
              <Text style={styles.profileInitialText}>{userName.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. RÉCAPITULATIF SEMAINE (Nouveau) */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Cette semaine dans votre zone</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
              <Text style={styles.summaryText}>3 signalements résolus</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="location" size={18} color="#166534" />
              <Text style={styles.summaryText}>1 point vert à 200m</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="information-circle" size={18} color="#3b82f6" />
              <Text style={styles.summaryText}>Prochain passage : Vendredi (Verre)</Text>
            </View>
          </View>
        </View>

        {/* 3. ALERTES & NOTIFICATIONS */}
        <View style={styles.notifStatusCard}>
          <View style={styles.notifStatusHeader}>
            <Ionicons name="notifications" size={22} color={notificationsEnabled ? "#10b981" : "#94a3b8"} />
            <Text style={styles.notifStatusTitle}>Alertes de collecte</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2e8f0', true: '#166534' }}
            />
          </View>
        </View>

        {isCollecting && (
          <View style={styles.alertCard}>
            <Ionicons name="trash" size={30} color="#fff" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>🚛 Le camion est là !</Text>
              <Text style={styles.alertDescription}>Préparez vos sacs, il arrive dans votre rue.</Text>
            </View>
          </View>
        )}

        {/* 4. BOUTON D'ACTION (ORANGE) */}
        <TouchableOpacity style={styles.reportActionBtn} onPress={handleQuickReport}>
          <View style={styles.quickActionContent}>
            <Ionicons name="alert-circle" size={28} color="white" />
            <View>
              <Text style={styles.quickActionTitle}>Signaler un problème</Text>
              <Text style={styles.quickActionSub}>Dépôt sauvage ou bac plein</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>

        {/* 5. IMPACT ÉCO (VERT) */}
        <Text style={styles.sectionTitle}>🌱 Mon Impact Eco</Text>
        <View style={styles.impactGrid}>
          <View style={[styles.impactCard, { borderBottomColor: '#22c55e' }]}>
            <Text style={styles.impactValue}>450</Text>
            <Text style={styles.impactLabel}>Points Eco</Text>
          </View>
          <View style={[styles.impactCard, { borderBottomColor: '#166534' }]}>
            <Text style={styles.impactValue}>12kg</Text>
            <Text style={styles.impactLabel}>Recyclé</Text>
          </View>
        </View>

        {/* 6. PROCHAINES COLLECTES */}
        <Text style={styles.sectionTitle}>🗓️ Planning de collecte</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleBadge, { backgroundColor: '#166534' }]} />
            <Text style={styles.scheduleDay}>Mercredi : Ordures ménagères</Text>
            <Text style={styles.scheduleTime}>18h</Text>
          </View>
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleBadge, { backgroundColor: '#eab308' }]} />
            <Text style={styles.scheduleDay}>Jeudi : Recyclage (Jaune)</Text>
            <Text style={styles.scheduleTime}>18h</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#F8FAf8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  greeting: { fontSize: 14, color: '#64748b' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  streetText: { fontSize: 13, color: '#166534', fontWeight: '600', marginTop: 4 },
  profileButton: { width: 45, height: 45 },
  profileInitial: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  profileInitialText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  statsSection: { marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  summaryCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 15, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#166534', elevation: 2 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  summaryText: { fontSize: 14, color: '#475569' },

  notifStatusCard: { backgroundColor: '#fff', marginHorizontal: 20, padding: 12, borderRadius: 16, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  notifStatusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifStatusTitle: { fontSize: 14, fontWeight: '600', color: '#475569' },

  alertCard: { flexDirection: 'row', backgroundColor: '#f59e0b', margin: 20, borderRadius: 16, padding: 15, alignItems: 'center', gap: 15 },
  alertTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  alertDescription: { color: 'white', fontSize: 12, opacity: 0.9 },

  reportActionBtn: { backgroundColor: '#ea580c', marginHorizontal: 20, marginTop: 15, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 3 },
  quickActionContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quickActionTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  quickActionSub: { color: 'white', fontSize: 11, opacity: 0.8 },

  impactGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  impactCard: { flex: 1, backgroundColor: 'white', padding: 15, borderRadius: 16, alignItems: 'center', borderBottomWidth: 3 },
  impactValue: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  impactLabel: { fontSize: 11, color: '#64748b' },

  scheduleCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 15, gap: 12 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scheduleBadge: { width: 8, height: 8, borderRadius: 4 },
  scheduleDay: { fontSize: 13, color: '#1e293b', flex: 1, marginLeft: 10 },
  scheduleTime: { fontSize: 13, fontWeight: 'bold', color: '#166534' },
});