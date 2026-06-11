import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Ellipse, Line, Rect } from 'react-native-svg';
import { API_URL } from '../services/api';
import { getToken, getUser } from '../services/auth';

interface AlerteResponse {
  actif: boolean;
  zone: string;
  current_lat?: number;
  current_lng?: number;
}

interface NotifData {
  type: string;
  zone: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
  }),
});

function SamaGoxLogo() {
  return (
    <View style={logoStyles.container}>
      <Svg width={42} height={42} viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r="38" fill="#166534" />
        <Rect x="33" y="14" width="14" height="9" rx="4" fill="#86efac" />
        <Rect x="20" y="22" width="40" height="9" rx="4" fill="#86efac" />
        <Rect x="23" y="33" width="34" height="28" rx="4" fill="#4ade80" />
        <Line x1="33" y1="36" x2="33" y2="58" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="40" y1="36" x2="40" y2="58" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="47" y1="36" x2="47" y2="58" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" />
        <Ellipse cx="62" cy="22" rx="8" ry="5" fill="#4ade80" rotation="-25" originX="62" originY="22" />
        <Line x1="60" y1="25" x2="54" y2="30" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
      <View style={logoStyles.textBlock}>
        <View style={logoStyles.textRow}>
          <Text style={logoStyles.sama}>SAMA</Text>
          <Text style={logoStyles.gox}> GOX</Text>
        </View>
        <Text style={logoStyles.tagline}>Mon quartier propre</Text>
      </View>
    </View>
  );
}

const logoStyles = StyleSheet.create({
  container:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  textBlock:  { flexDirection: 'column' },
  textRow:    { flexDirection: 'row', alignItems: 'baseline' },
  sama:       { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  gox:        { fontSize: 20, fontWeight: '300', color: '#4ade80', letterSpacing: 3 },
  tagline:    { fontSize: 9, fontWeight: '400', color: '#86efac', letterSpacing: 0.5, marginTop: 1 },
});

export default function HomeScreen() {
  const router = useRouter();
  const [alertActive, setAlertActive] = useState(false);
  const [truckZone, setTruckZone]     = useState<string | null>(null);
  const [user, setUser]               = useState<{ name: string; role?: string } | null>(null);
  const notifListener                 = useRef<any>(null);
  const responseListener              = useRef<any>(null);
  const lastAlertRef                  = useRef<boolean | null>(null);
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    (async () => {
      // ── 1. Check onboarding ──────────────────────────────
      const seen = await AsyncStorage.getItem('onboarding_done');
      if (!seen) {
        router.replace('/onboarding');
        return;
      }

 // Après — toujours afficher landing si pas connecté
const u = await getUser();
if (!u) {
  router.replace('/landing');
  return;
}

setUser(u); // ← ligne manquante

if (u?.role === 'driver') {
        router.replace('/driver');
        return;
      }

      registerForPushNotifications();
      setupNotificationListeners();
      checkTruckStatus();
      interval = setInterval(checkTruckStatus, 10000);
    })();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      notifListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('truck-alerts', {
        name: 'Alertes camion poubelle',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        lightColor: '#166534',
      });
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;
    try {
      const authToken = (await getToken()) ?? '';
      await fetch(`${API_URL}/save-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      });
    } catch (e) {
      console.log('Erreur save token:', e);
    }
  };

  const setupNotificationListeners = () => {
    notifListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as unknown as NotifData;
      if (data?.type === 'truck_alert') {
        setAlertActive(true);
        setTruckZone(data.zone);
      }
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as unknown as NotifData;
      if (data?.type === 'truck_alert') {
        setAlertActive(true);
        setTruckZone(data.zone);
      }
    });
  };

  const checkTruckStatus = async () => {
    try {
      const authToken = (await getToken()) ?? '';
      const response = await fetch(`${API_URL}/check-alerte`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });
      const data: AlerteResponse = await response.json();
      if (data.actif) {
        setAlertActive(true);
        setTruckZone(data.zone);
      } else {
        setAlertActive(false);
        setTruckZone(null);
      }
      lastAlertRef.current = data.actif;
    } catch (e) {
      console.error("Erreur statut camion:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <SamaGoxLogo />
          {user ? (
            <TouchableOpacity
              style={styles.profileContainer}
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.profileName}>{user.name}</Text>
              <View style={styles.profileCircle}>
                <Text style={styles.profileLetter}>{initial}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
              <Text style={styles.loginButtonText}>Connexion</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BANNIÈRE IMAGE */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('../assets/images/collecte.jpg')}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <View>
              <Text style={styles.bannerTitle}>Collecte des déchets</Text>
              <Text style={styles.bannerSubTitle}>Pensez à sortir vos poubelles à temps. Consultez le calendrier.</Text>
            </View>
            <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/calendrier')}>
              <Text style={styles.bannerButtonText}>Voir les détails</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BANNIÈRE ALERTE CAMION */}
        {alertActive && (
          <View style={styles.alertBannerLink}>
            <TouchableOpacity style={styles.alertLeft} onPress={() => router.push("/map")} activeOpacity={0.9}>
              <View style={styles.alertIconCircle}>
                <Ionicons name="trash-bin" size={20} color="white" />
              </View>
              <View style={styles.alertTextWrapper}>
                <Text style={styles.alertTitle}>🚚 Le camion est là !</Text>
                <Text style={styles.alertSub} numberOfLines={2}>
                  Préparez vos sacs, il arrive dans votre rue ({truckZone}).
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAlertActive(false)}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* ACTIONS RAPIDES */}
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 0 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    backgroundColor: '#14532d',
  },
  profileContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  profileName:   { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  profileCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center',
  },
  profileLetter:   { color: '#14532d', fontSize: 16, fontWeight: 'bold' },
  loginButton:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginButtonText: { color: 'white', fontWeight: '700', fontSize: 13 },
  bannerContainer: {
    marginHorizontal: 20, height: 200, borderRadius: 24,
    overflow: 'hidden', backgroundColor: '#000', marginTop: 16,
  },
  bannerImage:   { width: '100%', height: '100%', opacity: 0.85 },
  bannerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
    padding: 24, justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bannerTitle:    { fontSize: 22, fontWeight: 'bold', color: 'white' },
  bannerSubTitle: { fontSize: 14, color: '#e2e8f0', marginTop: 4 },
  bannerButton:   {
    backgroundColor: 'white', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  bannerButtonText: { color: '#166534', fontWeight: 'bold', fontSize: 13 },
  alertBannerLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f97316', marginHorizontal: 20, padding: 16,
    borderRadius: 20, marginTop: 20, gap: 12,
  },
  alertLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  alertTextWrapper: { flex: 1 },
  alertIconCircle:  {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  alertTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  alertSub:   { color: '#ffedd5', fontSize: 12, marginTop: 1 },
  closeBtn:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 6 },
  actionsSection: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle:   { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  actionCard: {
    width: '48%', backgroundColor: 'white', borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2,
  },
  iconCircle:  { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  actionDesc:  { fontSize: 11, color: '#64748b', marginTop: 2 },
});