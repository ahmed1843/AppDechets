import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';


const API_URL = "http://192.168.1.12:8000/api";

export default function HomeScreen() {
  const router = useRouter();
  const [alertActive, setAlertActive] = useState(false);
  const [truckZone, setTruckZone] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    checkTruckStatus();
    const interval = setInterval(checkTruckStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkTruckStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/check-alerte`);
      const data = await response.json();
      if (data.actif) {
        setAlertActive(true);
        setTruckZone(data.zone);
      } else {
        setAlertActive(false);
        setTruckZone(null);
      }
    } catch (e) {
      console.error("Erreur statut camion:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo/Logo de MMD Smart Clean.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.profileContainer} onPress={() => router.push('/profile')}>
            <Text style={styles.profileName}>Cavani</Text>
            <View style={styles.profileCircle}>
              <Text style={styles.profileLetter}>C</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- BANNIÈRE IMAGE --- */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <View>
              <Text style={styles.bannerTitle}>Collecte des déchets</Text>
              <Text style={styles.bannerSubTitle}>Pensez à sortir vos poubelles dès 6h.</Text>
            </View>
            <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/calendrier')}>
              <Text style={styles.bannerButtonText}>Voir les détails</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- BANDEAU ALERTE CAMION --- */}
        {alertActive && (
          <TouchableOpacity
            style={styles.alertBannerLink}
            onPress={() => router.push("/map")}
            activeOpacity={0.9}
          >
            <View style={styles.alertLeft}>
              <View style={styles.alertIconCircle}>
                <Ionicons name="trash-bin" size={20} color="white" />
              </View>
              <View style={styles.alertTextWrapper}>
                <Text style={styles.alertTitle}>🚚 Le camion est là !</Text>
                <Text style={styles.alertSub} numberOfLines={2}>
                  Préparez vos sacs, il arrive dans votre rue ({truckZone}).
                </Text>
              </View>
            </View>
            <View style={styles.alertRightButton}>
              <Text style={styles.alertRightButtonText}>Voir sur la carte</Text>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </View>
          </TouchableOpacity>
        )}

        {/* --- ACTIONS RAPIDES --- */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.grid}>

            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: '#ef4444', borderLeftWidth: 5 }]}
              onPress={() => router.push('/report')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="alert-circle" size={28} color="#ef4444" />
              </View>
              <Text style={styles.actionLabel}>Signaler</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Dépôt ou bac plein</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: '#166534', borderLeftWidth: 5 }]}
              onPress={() => router.push('/map')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="map" size={28} color="#166534" />
              </View>
              <Text style={styles.actionLabel}>Suivre camion</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Position en live</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: '#0284c7', borderLeftWidth: 5 }]}
              onPress={() => router.push('/calendrier')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
                <Ionicons name="calendar" size={28} color="#0284c7" />
              </View>
              <Text style={styles.actionLabel}>Calendrier</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Jours de collecte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { borderLeftColor: '#d97706', borderLeftWidth: 5 }]}
              onPress={() => router.push('/historique')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="time" size={28} color="#d97706" />
              </View>
              <Text style={styles.actionLabel}>Historique</Text>
              <Text style={styles.actionDesc} numberOfLines={1}>Mes signalements</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Espace pour ne pas être caché par la NavBar */}
        <View style={{ height: 100 }} />

      </ScrollView>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 0 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: '6%', paddingTop: 15, paddingBottom: 10, overflow: 'visible',
  },
  logoContainer: { width: 600, height: 95, justifyContent: 'center', alignItems: 'flex-start', marginLeft: -15, marginTop: -10 },
  logo: { width: '100%', height: '100%', resizeMode: 'contain' },
  profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  profileCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  profileLetter: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  bannerContainer: { marginHorizontal: '6%', height: 200, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  bannerImage: { width: '100%', height: '100%', opacity: 0.85 },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, padding: 24, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.3)' },
  bannerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  bannerSubTitle: { fontSize: 14, color: '#e2e8f0', marginTop: 4 },
  bannerButton: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  bannerButtonText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },

  alertBannerLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f97316', marginHorizontal: '6%', padding: 16, borderRadius: 20, marginTop: 25, gap: 12 },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  alertTextWrapper: { flex: 1 },
  alertIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  alertTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  alertSub: { color: '#ffedd5', fontSize: 12, marginTop: 1 },
  alertRightButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 30, gap: 4 },
  alertRightButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  actionsSection: { paddingHorizontal: '6%', marginTop: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  actionCard: { width: '48%', backgroundColor: 'white', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  actionDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
});