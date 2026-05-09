
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react"; // ← ajouter useRef
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Switch
} from "react-native";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, savePushToken } from '../services/notifications';

// Plus besoin de modifier cette ligne quand tu changes de Wifi !
import API_URL from "../services/api";


// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Citoyen");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastNotification, setLastNotification] = useState<{
    zone: string;
    type: 'arrivee' | 'depart';
    time: string;
  } | null>(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [street, setStreet] = useState<string | null>(null);

  const streetRef = useRef<string | null>(null); // ← ajouter cette ligne

// Remplace le useEffect complet par celui-ci :
useEffect(() => {
  const setup = async () => {
    // 1. Permission notifications web
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') console.log("🔔 Notifications web autorisées");
    }

    // 2. Récupérer la rue de l'utilisateur
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log("👤 Données user complètes:", data); // ← debug
      
      if (data.street) {
        setStreet(data.street);
        streetRef.current = data.street; // ← synchronise le ref immédiatement
        console.log("📍 Rue du citoyen:", data.street);
      } else {
        // Bug #3 : avertir explicitement si street est absent
        console.warn("⚠️ Aucune rue associée à cet utilisateur (user.street est null)");
        console.warn("👉 Assigne une rue via POST /api/assign-street depuis le profil");
      }
    } catch (error) {
      console.log("Erreur récupération rue:", error);
    }

    // 3. Enregistrer le token Expo (push)
    const expoToken = await registerForPushNotificationsAsync();
    if (expoToken) {
      console.log('📱 Push token Expo:', expoToken);
      await savePushToken(expoToken);
    }
  };

  setup();

  // 4. Polling — utilise streetRef.current au lieu de street
  //    pour éviter la closure stale (Bug #1)
  const interval = setInterval(async () => {
    try {
      const response = await fetch(`${API_URL}/check-alerte`);
      const data = await response.json();

console.log("👤 Données user complètes:", data);

// ✅ Charge le nom
if (data.name) setUserName(data.name.split(' ')[0]);

// Redirection driver
if (data.role === 'driver') {
  router.replace('/driver');
  return;
}

// Charge la rue
if (data.street) {
  setStreet(data.street);
  streetRef.current = data.street;
  console.log("📍 Rue du citoyen:", data.street);
}

      // Debug complet à chaque poll
      console.log("📡 Polling alerte:", data);
      console.log("📍 Rue (ref):", streetRef.current); // ← ref, toujours à jour

      if (!streetRef.current) {
        console.warn("⚠️ street non définie, comparaison impossible");
        return;
      }

      // Comparaison insensible à la casse et aux espaces (Bug #2 partiel)
      const zoneNormalisee = data.zone?.trim().toLowerCase();
      const streetNormalisee = streetRef.current?.trim().toLowerCase();

      console.log(`🔎 Comparaison: "${zoneNormalisee}" === "${streetNormalisee}" → ${zoneNormalisee === streetNormalisee}`);

      if (data.actif && zoneNormalisee === streetNormalisee) {
        console.log("🚛 ALERTE ! Le camion est dans votre rue !");

        // Évite les alertes répétées si déjà en cours
        setIsCollecting(prev => {
          if (!prev) {
            Alert.alert(
              "🚛 Collecte en cours !",
              `Les éboueurs sont dans ${data.zone}. Sortez vos poubelles !`
            );
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification("🚛 Collecte en cours", {
                body: `Les éboueurs sont dans ${data.zone}. Sortez vos poubelles !`
              });
            }
            setLastNotification({
              zone: data.zone,
              type: 'arrivee',
              time: "À l'instant"
            });
          }
          return true;
        });

      } else if (!data.actif) {
        // Remet à false quand le chauffeur termine
        setIsCollecting(false);
      }

    } catch (error) {
      console.log("Erreur polling:", error);
    }
  }, 5000);
 // 5. Écouteurs Expo — inchangés
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('📱 Notification Expo reçue:', notification);
    const title = notification.request.content.title ?? 'Notification';
    const body = notification.request.content.body ?? '';
    Alert.alert(title, body);
    if (title && title.includes('Collecte en cours')) {
      setIsCollecting(true);
      const dataStreet = notification.request.content.data?.street;
      setLastNotification({
        zone: typeof dataStreet === 'string' ? dataStreet : 'Votre rue',
        type: 'arrivee',
        time: "À l'instant"
      });
    }
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('🔔 Notification cliquée:', response);
  });

  return () => {
    clearInterval(interval);
    notificationListener.remove();
    responseListener.remove();
  };
}, []); // tableau vide intentionnel — streetRef évite la closure stale

  // Fonction pour tester les notifications
  const testNotification = () => {
    if (notificationsEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification("🧪 Test Notification", { body: "Ceci est une notification de test !" });
      }
      Alert.alert("✅ Notification test", "Une notification a été envoyée");
    } else {
      Alert.alert("🔕 Notifications désactivées", "Activez-les dans vos paramètres");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View style={styles.notifStatusCard}>
          <View style={styles.notifStatusHeader}>
            <Ionicons name="notifications" size={24} color={notificationsEnabled ? "#10b981" : "#94a3b8"} />
            <Text style={styles.notifStatusTitle}>
              {notificationsEnabled ? "Notifications activées" : "Notifications désactivées"}
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2e8f0', true: '#166534' }}
            />
          </View>
          <Text style={styles.notifStatusText}>
            {notificationsEnabled 
              ? "🔔 Vous serez alerté quand les éboueurs arrivent dans votre rue"
              : "🔕 Activez les notifications pour être alerté"}
          </Text>
        </View>

        {isCollecting && (
          <View style={styles.alertCard}>
            <View style={styles.alertIconContainer}>
              <Ionicons name="trash" size={32} color="#fff" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>🚛 Collecte en cours !</Text>
              <Text style={styles.alertDescription}>
                Les éboueurs sont dans votre rue. Sortez vos poubelles maintenant.
              </Text>
            </View>
          </View>
        )}

        {lastNotification && !isCollecting && (
          <View style={styles.lastNotifCard}>
            <Text style={styles.lastNotifLabel}>📱 Dernière notification</Text>
            <Text style={styles.lastNotifText}>
              {lastNotification.type === 'arrivee' ? '🚛 Début' : '✅ Fin'} de collecte - {lastNotification.zone}
            </Text>
            <Text style={styles.lastNotifTime}>{lastNotification.time}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>🗓️ Prochaines collectes</Text>
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleBadge, { backgroundColor: '#166534' }]} />
            <View>
              <Text style={styles.scheduleDay}>Mercredi (aujourd'hui)</Text>
              <Text style={styles.scheduleType}>🚛 Ordures ménagères</Text>
            </View>
            <Text style={styles.scheduleTime}>18h-20h</Text>
          </View>
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleBadge, { backgroundColor: '#10b981' }]} />
            <View>
              <Text style={styles.scheduleDay}>Jeudi</Text>
              <Text style={styles.scheduleType}>♻️ Recyclage (jaune)</Text>
            </View>
            <Text style={styles.scheduleTime}>18h-20h</Text>
          </View>
          <View style={styles.scheduleItem}>
            <View style={[styles.scheduleBadge, { backgroundColor: '#8b5cf6' }]} />
            <View>
              <Text style={styles.scheduleDay}>Samedi</Text>
              <Text style={styles.scheduleType}>🟢 Verre</Text>
            </View>
            <Text style={styles.scheduleTime}>10h-12h</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={testNotification}>
          <Ionicons name="volume-high" size={20} color="#166534" />
          <Text style={styles.testButtonText}>🔔 Tester la notification</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Nos services</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard} onPress={() => router.push("/map")}>
            <View style={[styles.serviceIcon, { backgroundColor: '#10b98115' }]}>
              <Ionicons name="map" size={28} color="#10b981" />
            </View>
            <Text style={styles.serviceName}>Voir la carte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceCard} onPress={() => router.push("/calendrier")}>
            <View style={[styles.serviceIcon, { backgroundColor: '#3b82f615' }]}>
              <Ionicons name="calendar" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.serviceName}>Calendrier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceCard} onPress={() => router.push("/guide")}>
            <View style={[styles.serviceIcon, { backgroundColor: '#f59e0b15' }]}>
              <Ionicons name="book" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.serviceName}>Guide de tri</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  greeting: { fontSize: 14, color: '#64748b' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  streetText: { fontSize: 12, color: '#64748b', marginTop: 4 },
  profileButton: { width: 48, height: 48 },
  profileInitial: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  profileInitialText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  notifStatusCard: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  notifStatusHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  notifStatusTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1e293b' },
  notifStatusText: { fontSize: 13, color: '#64748b' },
  alertCard: { flexDirection: 'row', backgroundColor: '#f59e0b', margin: 20, borderRadius: 20, padding: 20 },
  alertIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  alertContent: { flex: 1 },
  alertTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  alertDescription: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  lastNotifCard: { backgroundColor: '#f1f5f9', marginHorizontal: 20, marginBottom: 10, padding: 16, borderRadius: 16 },
  lastNotifLabel: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  lastNotifText: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  lastNotifTime: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginHorizontal: 20, marginTop: 20, marginBottom: 12 },
  scheduleCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 16, padding: 16, gap: 16 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scheduleBadge: { width: 12, height: 12, borderRadius: 6 },
  scheduleDay: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  scheduleType: { fontSize: 12, color: '#64748b' },
  scheduleTime: { fontSize: 14, fontWeight: '500', color: '#166534', marginLeft: 'auto' },
  testButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 20, paddingVertical: 12, backgroundColor: '#f0fdf4', borderRadius: 12 },
  testButtonText: { fontSize: 14, color: '#166534', fontWeight: '500' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 15, marginBottom: 30 },
  serviceCard: { width: '47%', backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center' },
  serviceIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceName: { fontSize: 14, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
});