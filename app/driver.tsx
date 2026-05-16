import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as Location from 'expo-location';

// ✅ IP en dur (le .env ne se charge qu'au démarrage complet)
const API_URL = "http://192.168.1.12:8000/api";

export default function DriverScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentZone, setCurrentZone] = useState<string | null>("Plateau");
  const [isCollecting, setIsCollecting] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [zones, setZones] = useState([
    { id: 1, name: "Plateau", habitants: 45, status: "pending" },
    { id: 2, name: "Almadies", habitants: 58, status: "pending" },
    { id: 3, name: "Médina", habitants: 63, status: "pending" },
  ]);

  // ✅ Démarrer le suivi GPS avec expo-location (fonctionne sur iPhone)
  const startTracking = async () => {
    console.log("Démarrage du tracking GPS...");

    // Demander la permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Le GPS est nécessaire pour le suivi de collecte.');
      return;
    }

    // Lancer le watch
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        console.log("📍 Position captée :", latitude, longitude);

        fetch(`${API_URL}/alerte-chauffeur`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zone_name: currentZone,
            actif: true,
            current_lat: latitude,
            current_lng: longitude,
          }),
        })
        .then(() => console.log("✅ Serveur mis à jour"))
        .catch(err => console.log("❌ Erreur fetch GPS:", err));
      }
    );
  };

  // ✅ Arrêter le suivi GPS
  const stopTracking = () => {
    if (locationSubscription.current !== null) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      console.log("🛑 Tracking GPS arrêté.");
    }
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  const handleArrival = async () => {
    console.log("Tentative de démarrage...");
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/alerte-chauffeur`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_name: currentZone,
          actif: true,
        }),
      });

      if (response.ok) {
        setIsCollecting(true);
        await startTracking();
        console.log("Collecte activée avec succès !");
      }
    } catch (error) {
      console.error("Erreur au clic :", error);
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Alert.alert à la place de window.confirm (fonctionne sur iPhone)
  const handleDeparture = () => {
    if (!currentZone) return;

    Alert.alert(
      "Terminer la collecte",
      `Terminer la collecte dans ${currentZone} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Terminer", style: "destructive", onPress: finishCollection },
      ]
    );
  };

  const finishCollection = async () => {
    try {
      setLoading(true);
      stopTracking();

      await fetch(`${API_URL}/alerte-chauffeur`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zone_name: currentZone,
          actif: false,
        }),
      });

      setIsCollecting(false);
      setZones(prev =>
        prev.map(z => z.name === currentZone ? { ...z, status: "termine" } : z)
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const getZoneStatusColor = (status: string) => {
    switch(status) {
      case 'termine': return '#10b981';
      case 'en_cours': return '#f59e0b';
      default: return '#e2e8f0';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Mise à jour du système...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚛 Mode Collecte</Text>
          <TouchableOpacity onPress={() => { stopTracking(); router.replace("/"); }}>
            <Ionicons name="log-out" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <View style={styles.currentZoneCard}>
          <Text style={styles.currentZoneLabel}>📍 Zone actuelle</Text>
          <Text style={styles.currentZoneName}>{currentZone || "Non sélectionnée"}</Text>
        </View>

        <Text style={styles.sectionTitle}>📋 Zones à collecter</Text>
        <View style={styles.zonesList}>
          {zones.map((zone) => (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneCard,
                currentZone === zone.name && styles.zoneCardSelected,
                zone.status === 'termine' && styles.zoneCardCompleted
              ]}
              onPress={() => !isCollecting && setCurrentZone(zone.name)}
            >
              <View style={styles.zoneInfo}>
                <Text style={[styles.zoneName, currentZone === zone.name && styles.zoneNameSelected]}>
                  {zone.name}
                </Text>
                <Text style={styles.zoneHabitants}>
                  <Ionicons name="people" size={12} color="#64748b" /> {zone.habitants} habitants
                </Text>
              </View>
              <View style={[styles.zoneStatus, { backgroundColor: getZoneStatusColor(zone.status) }]}>
                {zone.status === 'termine' && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {currentZone && (
          !isCollecting ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleArrival}>
              <Ionicons name="notifications" size={48} color="#fff" />
              <Text style={styles.actionButtonTitle}>Je suis arrivé</Text>
              <Text style={styles.actionButtonSubtitle}>Activer le suivi GPS dans {currentZone}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonActive]} onPress={handleDeparture}>
              <Ionicons name="checkmark-circle" size={48} color="#fff" />
              <Text style={styles.actionButtonTitle}>Collecte terminée</Text>
              <Text style={styles.actionButtonSubtitle}>Arrêter le GPS pour {currentZone} ✓</Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FBF7' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  currentZoneCard: { backgroundColor: '#166534', marginHorizontal: 20, marginTop: 10, marginBottom: 20, padding: 20, borderRadius: 20, alignItems: 'center' },
  currentZoneLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  currentZoneName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#64748b', marginHorizontal: 20, marginBottom: 12 },
  zonesList: { paddingHorizontal: 20, gap: 10, marginBottom: 30 },
  zoneCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0' },
  zoneCardSelected: { borderColor: '#166534', backgroundColor: '#f0fdf4' },
  zoneCardCompleted: { backgroundColor: '#f8fafc', opacity: 0.6 },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  zoneNameSelected: { color: '#166534' },
  zoneHabitants: { fontSize: 12, color: '#64748b' },
  zoneStatus: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionButton: { backgroundColor: '#166534', borderRadius: 24, padding: 32, alignItems: 'center', marginHorizontal: 20, marginBottom: 30 },
  actionButtonActive: { backgroundColor: '#f59e0b' },
  actionButtonTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  actionButtonSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
});