import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";

// Plus besoin de modifier cette ligne quand tu changes de Wifi !
const API_URL = process.env.EXPO_PUBLIC_API_URL;


export default function DriverScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentZone, setCurrentZone] = useState<string | null>("Plateau");
  const [isCollecting, setIsCollecting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // ✅ Vraies zones (Plateau, Almadies, Médina)
  const [zones, setZones] = useState([
    { id: 1, name: "Plateau", habitants: 45, status: "pending" },
    { id: 2, name: "Almadies", habitants: 58, status: "pending" },
    { id: 3, name: "Médina", habitants: 63, status: "pending" },
  ]);

  // Fonction pour envoyer la notification
  const sendNotification = async (street: string, action: string) => {
    const token = localStorage.getItem('token');
    console.log("📤 Envoi notification à:", `${API_URL}/notify-street`);
    console.log("🔑 Token:", token);
    console.log("📦 Body:", { street, action });
    
    try {
      const response = await fetch(`${API_URL}/notify-street`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ street, action })
      });
      
      const data = await response.json();
      console.log("📥 Réponse:", data);
      
      if (response.ok) {
        return { success: true, notified: data.notified };
      } else {
        return { success: false, error: data.error || data.message };
      }
    } catch (error) {
      console.error("❌ Erreur réseau:", error);
      return { success: false, error: "Impossible de contacter le serveur" };
    }
  };

const handleArrival = () => {
  if (!currentZone) return;

  Alert.alert(
    "🚛 Envoyer l'alerte ?",
    `Les habitants de ${currentZone} seront prévenus`,
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "✅ Envoyer",
        onPress: async () => {
          try {
            setLoading(true);

            // Active l'alerte côté Laravel
            const response = await fetch(`${API_URL}/alerte-chauffeur`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                zone_name: currentZone,
                actif: true,
              }),
            });

            const data = await response.json();

            console.log("✅ Alerte envoyée :", data);

            setIsCollecting(true);

            setZones(prev =>
              prev.map(z =>
                z.name === currentZone
                  ? { ...z, status: "en_cours" }
                  : z
              )
            );

            Alert.alert(
              "🚛 Collecte démarrée",
              `Notification envoyée pour ${currentZone}`
            );
          } catch (error) {
            console.log(error);

            Alert.alert(
              "Erreur",
              "Impossible d'envoyer l'alerte"
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
};

const handleDeparture = () => {
  if (!currentZone) return;

  Alert.alert(
    "🏁 Fin de collecte ?",
    `Terminer la collecte dans ${currentZone}`,
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "✅ Terminer",
        onPress: async () => {
          try {
            setLoading(true);

            await fetch(`${API_URL}/alerte-chauffeur`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                zone_name: currentZone,
                actif: false,
              }),
            });

            setIsCollecting(false);

            setZones(prev =>
              prev.map(z =>
                z.name === currentZone
                  ? { ...z, status: "termine" }
                  : z
              )
            );

            Alert.alert(
              "✅ Collecte terminée",
              `${currentZone} terminé`
            );
          } catch (error) {
            console.log(error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]
  );
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
        <Text style={styles.loadingText}>Envoi de l'alerte...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚛 Mode Collecte</Text>
          <TouchableOpacity onPress={() => router.replace("/")}>
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
              onPress={() => setCurrentZone(zone.name)}
            >
              <View style={styles.zoneInfo}>
                <Text style={[
                  styles.zoneName,
                  currentZone === zone.name && styles.zoneNameSelected
                ]}>
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
              <Text style={styles.actionButtonSubtitle}>dans {currentZone}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.actionButtonActive]} onPress={handleDeparture}>
              <Ionicons name="checkmark-circle" size={48} color="#fff" />
              <Text style={styles.actionButtonTitle}>Collecte terminée</Text>
              <Text style={styles.actionButtonSubtitle}>{currentZone} ✓</Text>
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