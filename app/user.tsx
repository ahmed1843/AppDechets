import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActionButton } from "../components/ui/ActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Colors } from "../constants/Design";
import { MOCK_ALERTS } from "../constants/mockData";

export default function UserScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Simulation de l'alerte de proximité
  useEffect(() => {
    if (notificationsEnabled) {
      const timer = setTimeout(() => {
        alert(
          "🚚 Camion à proximité !\n\n" +
          "Le camion est à 200 mètres. Il est temps de sortir vos poubelles. Pas besoin de klaxon !"
        );
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [notificationsEnabled]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Profil */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.welcomeText}>Bonjour,</Text>
            <Text style={styles.userNameText}>Moussa Diop 👋</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarInitial}>M</Text>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>

        {/* 2. État du camion */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Collecte en cours</Text>
            <StatusBadge status="active" label="En direct" />
          </View>
          
          <View style={styles.truckInfo}>
            <View style={styles.truckIconBox}>
              <Ionicons name="navigate" color={Colors.accent} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.truckDistance}>Camion à 1.2 km de vous</Text>
              <Text style={styles.truckEta}>Arrivée prévue dans environ 14 min</Text>
            </View>
          </View>

          <ActionButton 
            label="Voir sur la carte" 
            onPress={() => router.push("/map")} 
            variant="ghost"
            style={styles.mapBtn}
          />
        </View>

        {/* 3. Calendrier de collecte */}
        <TouchableOpacity 
          style={styles.calendarMiniCard} 
          onPress={() => router.push("/calendrier")}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.accent} />
          <Text style={styles.calendarText}>Voir le planning de collecte</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* 4. Alertes de passage */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alertes de passage</Text>
            <TouchableOpacity 
              onPress={() => setNotificationsEnabled(!notificationsEnabled)}
              style={[styles.toggle, notificationsEnabled && styles.toggleActive]}
            >
              <Ionicons 
                name={notificationsEnabled ? "notifications" : "notifications-outline"} 
                size={22} 
                color={notificationsEnabled ? Colors.white : Colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Soyez notifié quand le camion approche de votre domicile.
          </Text>
        </View>

        {/* 5. Signalement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Un problème dans votre rue ?</Text>
          <TouchableOpacity 
            style={styles.reportCard} 
            onPress={() => router.push("/signaler")}
          >
            <View style={styles.reportIconBox}>
              <Ionicons name="warning" color={Colors.danger} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportText}>Signaler un dépôt sauvage</Text>
              <Text style={styles.reportSubtext}>Envoyez une photo pour une intervention.</Text>
            </View>
            <Ionicons name="chevron-forward" color={Colors.accent} size={20} />
          </TouchableOpacity>
        </View>

        {/* 6. Activité récente */}
        <Text style={styles.listHeader}>Activité récente</Text>
        {MOCK_ALERTS.map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            <View style={[styles.alertDot, { backgroundColor: alert.type === 'delay' ? Colors.warning : Colors.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.timestamp}</Text>
            </View>
            <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, paddingBottom: 40 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25, marginTop: 10 },
  welcomeText: { color: Colors.textMuted, fontSize: 14 },
  userNameText: { color: Colors.textPrimary, fontSize: 20, fontWeight: "800" },
  profileButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.accentDim, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: Colors.accentSoft },
  avatarInitial: { color: Colors.accent, fontWeight: "bold", fontSize: 18 },
  onlineDot: { position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.background },
  statusCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  statusTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "700" },
  truckInfo: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 20 },
  truckIconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: Colors.accentDim, alignItems: "center", justifyContent: "center" },
  truckDistance: { color: Colors.textPrimary, fontSize: 16, fontWeight: "700" },
  truckEta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  mapBtn: { marginTop: 10 },
  
  // Calendrier
  calendarMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    gap: 12,
  },
  calendarText: { flex: 1, color: Colors.textPrimary, fontSize: 14, fontWeight: "600" },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "700" },
  sectionSubtitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  toggle: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  toggleActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  
  reportCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, marginTop: 12, gap: 15 },
  reportIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.dangerDim, alignItems: "center", justifyContent: "center" },
  reportText: { color: Colors.textPrimary, fontSize: 15, fontWeight: "700" },
  reportSubtext: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },

  listHeader: { color: Colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  alertItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, padding: 16, borderRadius: 16, marginBottom: 10, gap: 12 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertMessage: { color: Colors.textPrimary, fontSize: 14, fontWeight: "600" },
  alertTime: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
});
