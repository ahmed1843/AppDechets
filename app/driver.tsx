import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet,
  TouchableOpacity, ActivityIndicator, Switch, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from "../services/api";
import { getToken, logout } from '../services/auth';

const ZONES = ['Plateau', 'Almadies', 'Médina'];

export default function DriverScreen() {
  const router = useRouter();
  const [alerteActive, setAlerteActive]   = useState(false);
  const [zoneDetectee, setZoneDetectee]   = useState<string | null>(null);
  const [position, setPosition]           = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading]             = useState(false);
  const [gpsAuto, setGpsAuto]             = useState(false);
  const [selectedZone, setSelectedZone]   = useState<string | null>(null);

  const locationSub     = useRef<any>(null);
  const intervalRef     = useRef<any>(null);
  const positionRef     = useRef<{ lat: number; lng: number } | null>(null);
  const alerteRef       = useRef(false);
  const selectedZoneRef = useRef<string | null>(null);

  useEffect(() => { alerteRef.current = alerteActive; }, [alerteActive]);
  useEffect(() => { selectedZoneRef.current = selectedZone; }, [selectedZone]);

  useEffect(() => {
    if (gpsAuto) {
      startGpsTracking();
    } else {
      stopGpsTracking();
    }
    return () => {
      stopGpsTracking();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gpsAuto]);

  const startGpsTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission GPS refusée', 'Activez la localisation.');
      setGpsAuto(false);
      return;
    }
    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 0 },
      (loc) => {
        const pos = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setPosition(pos);
        positionRef.current = pos;
      }
    );
  };

  const stopGpsTracking = () => {
    if (locationSub.current) {
      locationSub.current.remove();
      locationSub.current = null;
    }
  };

  const envoyerAlerte = async (zone: string, actif: boolean) => {
    console.log('=== ENVOI ALERTE ===', { zone, actif, lat: positionRef.current?.lat, lng: positionRef.current?.lng });
    try {
      const token = await getToken();
      console.log('=== TOKEN ===', token ? 'OK' : 'NULL ❌');
      const response = await fetch(`${API_URL}/alerte-chauffeur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          zone_name: zone,
          actif,
          lat: positionRef.current?.lat ?? null,
          lng: positionRef.current?.lng ?? null,
        }),
      });
      const data = await response.json();
      console.log('=== REPONSE ALERTE ===', data);
      setAlerteActive(actif);
    } catch (e) {
      console.log('Erreur envoi alerte:', e);
    }
  };

  // ✅ FIX PRINCIPAL : try/finally correctement fermés, plus imbriqués
  const activerManuellement = async () => {
    console.log('=== ZONE SELECTEE ===', selectedZone);
    console.log('=== GPS ACTIF ===', gpsAuto, positionRef.current);

    if (!selectedZone) {
      Alert.alert('Sélectionnez une zone', 'Choisissez la zone avant d\'activer l\'alerte.');
      return;
    }

    if (!gpsAuto) {
      Alert.alert(
        'GPS requis',
        'Activez le suivi GPS pour envoyer votre position.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Activer GPS', onPress: () => setGpsAuto(true) },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const newState = !alerteActive;
      await envoyerAlerte(selectedZone, newState);
      setZoneDetectee(newState ? selectedZone : null);

      if (newState) {
        intervalRef.current = setInterval(async () => {
          const zone = selectedZoneRef.current;
          if (zone && alerteRef.current) {
            await envoyerAlerte(zone, true);
          }
        }, 4000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'alerte.');
    } finally {
      setLoading(false);
    }
  }; // ✅ FIX : fermée ici

  // ✅ FIX : handleLogout au bon niveau du composant
  const handleLogout = async () => {
    stopGpsTracking();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>📍 Suivi GPS</Text>
            <Text style={styles.cardSub}>Active pour envoyer votre position réelle</Text>
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
          </Text>
        )}
        {!position && gpsAuto && (
          <Text style={styles.gpsText}>Recherche du signal GPS…</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Activation manuelle</Text>
        <Text style={styles.cardSub}>Sélectionnez la zone et activez l'alerte</Text>
        <View style={styles.zoneList}>
          {ZONES.map((zone) => (
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