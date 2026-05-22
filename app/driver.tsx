import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator, Switch, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// ✅ Après
import { API_URL } from "../services/api";
import { getToken, logout } from '../services/auth';

const ZONES: Record<string, { lat: number; lng: number; rayon_km: number }> = {
  'Plateau':  { lat: 14.6679, lng: -17.4424, rayon_km: 1.2 },
  'Almadies': { lat: 14.7378, lng: -17.5110, rayon_km: 1.5 },
  'Médina':   { lat: 14.6928, lng: -17.4467, rayon_km: 1.0 },
};

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DriverScreen() {
  const router = useRouter();
  const [alerteActive, setAlerteActive] = useState(false);
  const [zoneDetectee, setZoneDetectee] = useState<string | null>(null);
  const [position, setPosition]         = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading]           = useState(false);
  const [gpsAuto, setGpsAuto]           = useState(true);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const locationSub = useRef<any>(null);
  const lastZoneRef = useRef<string | null>(null);

  useEffect(() => {
    if (gpsAuto) {
      startGpsTracking();
    } else {
      stopGpsTracking();
    }
    return () => stopGpsTracking();
  }, [gpsAuto]);

  const startGpsTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission GPS refusée', 'Activez la localisation pour le suivi automatique.');
      setGpsAuto(false);
      return;
    }
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 15000, distanceInterval: 50 },
      (loc) => {
        const pos = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setPosition(pos);
        detecterZone(pos);
      }
    );
  };

  const stopGpsTracking = () => {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
  };

  const detecterZone = async (pos: { lat: number; lng: number }) => {
    for (const [nom, zone] of Object.entries(ZONES)) {
      const dist = distanceKm(pos.lat, pos.lng, zone.lat, zone.lng);
      if (dist < zone.rayon_km) {
        setZoneDetectee(nom);
        if (lastZoneRef.current !== nom) {
          lastZoneRef.current = nom;
          await envoyerAlerte(nom, true);
        }
        return;
      }
    }
    if (lastZoneRef.current !== null) {
      lastZoneRef.current = null;
      setZoneDetectee(null);
      await desactiverAlerte();
    }
  };

  // ✅ Utilise /alerte-chauffeur (route publique, plus simple)
  const envoyerAlerte = async (zone: string, actif: boolean) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/alerte-chauffeur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          zone_name: zone,
          actif,
          lat: position?.lat,
          lng: position?.lng,
        }),
      });
      setAlerteActive(actif);
    } catch (e) {
      console.log('Erreur envoi alerte:', e);
    }
  };

  const activerManuellement = async () => {
    if (!selectedZone) {
      Alert.alert('Sélectionnez une zone', 'Choisissez la zone avant d\'activer l\'alerte.');
      return;
    }
    setLoading(true);
    try {
      await envoyerAlerte(selectedZone, !alerteActive);
      setZoneDetectee(alerteActive ? null : selectedZone);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'alerte.');
    } finally {
      setLoading(false);
    }
  };

  const desactiverAlerte = async () => {
    for (const zone of Object.keys(ZONES)) {
      try {
        await envoyerAlerte(zone, false);
      } catch (_) {}
    }
    setAlerteActive(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚛 Tableau de bord chauffeur</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Statut */}
      <View style={[styles.statusCard, alerteActive ? styles.statusActive : styles.statusInactive]}>
        <Text style={styles.statusIcon}>{alerteActive ? '🚛' : '🟢'}</Text>
        <View>
          <Text style={styles.statusTitle}>
            {alerteActive ? `Alerte active — ${zoneDetectee}` : 'Aucune alerte active'}
          </Text>
          <Text style={styles.statusSub}>
            {alerteActive ? 'Les citoyens ont été notifiés' : 'En attente de démarrage de tournée'}
          </Text>
        </View>
      </View>

      {/* GPS Auto */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>📍 Suivi GPS automatique</Text>
            <Text style={styles.cardSub}>Notifie quand vous entrez dans une zone</Text>
          </View>
          <Switch
            value={gpsAuto}
            onValueChange={setGpsAuto}
            trackColor={{ false: '#cbd5e1', true: '#166534' }}
            thumbColor="#fff"
          />
        </View>
        {position && (
          <Text style={styles.gpsText}>
            📌 {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
            {zoneDetectee ? ` — Zone : ${zoneDetectee}` : ' — Hors zone'}
          </Text>
        )}
      </View>

      {/* Activation manuelle */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Activation manuelle</Text>
        <Text style={styles.cardSub}>Sélectionnez la zone et activez l'alerte</Text>
        <View style={styles.zoneList}>
          {Object.keys(ZONES).map((zone) => (
            <TouchableOpacity
              key={zone}
              style={[styles.zoneBtn, selectedZone === zone && styles.zoneBtnActive]}
              onPress={() => setSelectedZone(zone)}
            >
              <Text style={[styles.zoneBtnText, selectedZone === zone && styles.zoneBtnTextActive]}>
                {zone}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.alertBtn, alerteActive && styles.alertBtnStop]}
          onPress={activerManuellement}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.alertBtnText}>
              {alerteActive ? '⏹ Arrêter l\'alerte' : '▶ Démarrer l\'alerte'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b' },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, padding: 16, borderRadius: 12,
  },
  statusActive:   { backgroundColor: '#fef3c7' },
  statusInactive: { backgroundColor: '#f0fdf4' },
  statusIcon:  { fontSize: 32 },
  statusTitle: { fontWeight: '700', fontSize: 15, color: '#1e293b' },
  statusSub:   { fontSize: 12, color: '#64748b', marginTop: 2 },
  card: {
    backgroundColor: '#fff', margin: 16, marginTop: 0,
    borderRadius: 12, padding: 16, gap: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '600', fontSize: 15, color: '#1e293b' },
  cardSub:   { fontSize: 12, color: '#64748b', marginTop: 2 },
  gpsText:   { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  zoneList:  { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  zoneBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
  },
  zoneBtnActive:     { backgroundColor: '#166534', borderColor: '#166534' },
  zoneBtnText:       { fontSize: 13, color: '#475569' },
  zoneBtnTextActive: { color: '#fff', fontWeight: '600' },
  alertBtn: {
    backgroundColor: '#166534', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 8,
  },
  alertBtnStop: { backgroundColor: '#ef4444' },
  alertBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});