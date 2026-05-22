import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView, StyleSheet, Text, View,
  TouchableOpacity, ActivityIndicator, Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../services/api';
import { getToken } from '../services/auth';

// ✅ Import react-native-maps seulement sur mobile
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Polyline = RNMaps.Polyline;
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const truckMarkerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [truckZone, setTruckZone] = useState<string | null>(null);
  const [citizenPos, setCitizenPos] = useState<{ lat: number; lng: number } | null>(null);
  const [alertActive, setAlertActive] = useState(false);
  const [truckPos, setTruckPos] = useState<{ lat: number; lng: number } | null>(null);

  const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
    Plateau:  { lat: 14.6679, lng: -17.4424 },
    Almadies: { lat: 14.7378, lng: -17.551 },
    Médina:   { lat: 14.6928, lng: -17.4467 },
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getCitizenLocationMobile();
    } else {
      initMap();
    }

    const interval = setInterval(() => {
      pollTruck();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCitizenLocationMobile = async () => {
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCitizenPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch (e) {
      console.log("Erreur géoloc mobile:", e);
    } finally {
      setLoading(false);
      pollTruck();
    }
  };

  const initMap = async () => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setupLeaflet();
      document.head.appendChild(script);
    } else {
      setupLeaflet();
    }
  };

  const setupLeaflet = () => {
    const L = (window as any).L;
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([14.6937, -17.4441], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCitizenPos(cPos);
          const citizenIcon = L.divIcon({
            html: `<div style="font-size:24px;">🏠</div>`,
            className: 'citizen-marker',
          });
          L.marker([cPos.lat, cPos.lng], { icon: citizenIcon }).addTo(map);
          map.setView([cPos.lat, cPos.lng], 14);
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
    pollTruck();
  };

  // ✅ Appel authentifié pour filtrer par zone du citoyen
  const pollTruck = async () => {
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/check-alerte`, { headers });
      const data = await response.json();

      if (data.actif) {
        setAlertActive(true);
        setTruckZone(data.zone);

        let pos = null;
        if (data.current_lat && data.current_lng) {
          pos = { lat: parseFloat(data.current_lat), lng: parseFloat(data.current_lng) };
        } else if (data.zone && ZONE_COORDS[data.zone]) {
          pos = ZONE_COORDS[data.zone];
        }

        if (pos) {
          setTruckPos(pos);
          if (Platform.OS === 'web') drawRoute(pos);
        }
      } else {
        setAlertActive(false);
        setTruckPos(null);
        if (Platform.OS === 'web') clearRoute();
      }
    } catch (e) {
      console.log("Erreur poll:", e);
    }
  };

  const clearRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }
    if (truckMarkerRef.current) { map.removeLayer(truckMarkerRef.current); truckMarkerRef.current = null; }
  };

  const drawRoute = (truck: { lat: number; lng: number }) => {
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    if (!map || !L) return;

    if (truckMarkerRef.current) map.removeLayer(truckMarkerRef.current);
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);

    const truckIcon = L.divIcon({
      html: `<div style="font-size:35px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚛</div>`,
      className: 'truck-marker',
    });

    truckMarkerRef.current = L.marker([truck.lat, truck.lng], { icon: truckIcon }).addTo(map);

    if (citizenPos) {
      routeLayerRef.current = L.polyline(
        [[truck.lat, truck.lng], [citizenPos.lat, citizenPos.lng]],
        { color: '#166534', weight: 3, dashArray: '10, 10' }
      ).addTo(map);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi en temps réel</Text>
        <TouchableOpacity onPress={pollTruck}>
          <Ionicons name="refresh" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      {alertActive ? (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>🚛 Camion en route vers {truckZone}</Text>
        </View>
      ) : (
        <View style={styles.inactiveBanner}>
          <Text style={styles.inactiveText}>Aucun camion actif</Text>
        </View>
      )}

      {Platform.OS === 'web' ? (
        <div
          ref={mapRef}
          style={{
            flex: 1,
            width: '100%',
            minHeight: '500px',
            backgroundColor: '#e5e7eb',
          }}
        />
      ) : loading ? (
        <View style={styles.noMap}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.noMapText}>Chargement de la carte…</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: citizenPos?.lat ?? 14.6937,
            longitude: citizenPos?.lng ?? -17.4441,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {citizenPos && (
            <Marker
              coordinate={{ latitude: citizenPos.lat, longitude: citizenPos.lng }}
              title="Ma position"
              pinColor="#166534"
            />
          )}

          {truckPos && (
            <Marker
              coordinate={{ latitude: truckPos.lat, longitude: truckPos.lng }}
              title={`Camion — ${truckZone}`}
              pinColor="#f59e0b"
            />
          )}

          {truckPos && citizenPos && (
            <Polyline
              coordinates={[
                { latitude: truckPos.lat, longitude: truckPos.lng },
                { latitude: citizenPos.lat, longitude: citizenPos.lng },
              ]}
              strokeColor="#166534"
              strokeWidth={3}
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  alertBanner: { backgroundColor: '#f59e0b', padding: 12, paddingHorizontal: 16 },
  alertText: { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  inactiveBanner: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  inactiveText: { color: '#166534', fontSize: 13, textAlign: 'center' },
  map: { flex: 1 },
  noMap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noMapText: { fontSize: 16, color: '#94a3b8' },
});