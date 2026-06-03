import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from '../services/api';
import { getToken } from '../services/auth';

// APRÈS
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView = RNMaps.default;
    Marker = RNMaps.Marker;
    Polyline = RNMaps.Polyline;
  } catch (e) {
    console.log('react-native-maps non disponible sur web');
  }
}
const COLLECTE_POINTS = [
  // Dakar Plateau / Centre
  { id: 'pc1',  name: 'Collecte Plateau Sandaga',     lat: 14.6741, lng: -17.4366 },
  { id: 'pc2',  name: 'Collecte Plateau HLM',         lat: 14.6960, lng: -17.4445 },
  { id: 'pc3',  name: 'Collecte Médina Centre',       lat: 14.6928, lng: -17.4467 },
  { id: 'pc4',  name: 'Collecte Médina Rue 10',       lat: 14.6890, lng: -17.4410 },
  // Almadies / Ouakam / Ngor
  { id: 'pc5',  name: 'Collecte Almadies Rond-point', lat: 14.7378, lng: -17.5010 },
  { id: 'pc6',  name: 'Collecte Ouakam Mosquée',      lat: 14.7285, lng: -17.4890 },
  { id: 'pc7',  name: 'Collecte Ngor Village',        lat: 14.7450, lng: -17.5150 },
  // Parcelles / Grand Yoff / Camberène
  { id: 'pc8',  name: 'Collecte Parcelles Assainies', lat: 14.7569, lng: -17.4347 },
  { id: 'pc9',  name: 'Collecte Grand Yoff',          lat: 14.7350, lng: -17.4500 },
  { id: 'pc10', name: 'Collecte Camberène',           lat: 14.7650, lng: -17.4300 },
  // Guédiawaye / Pikine
  { id: 'pc11', name: 'Collecte Guédiawaye Marché',   lat: 14.7720, lng: -17.4050 },
  { id: 'pc12', name: 'Collecte Pikine Icotaf',       lat: 14.7550, lng: -17.3900 },
  { id: 'pc13', name: 'Collecte Pikine Terminus',     lat: 14.7480, lng: -17.3800 },
  // Yoff / Rufisque
  { id: 'pc14', name: 'Collecte Yoff Village',        lat: 14.7530, lng: -17.4980 },
  { id: 'pc15', name: 'Collecte Rufisque Centre',     lat: 14.7157, lng: -17.2728 },
];

type Filter = 'tous' | 'camion' | 'prn' | 'alertes';

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: 'tous',    label: 'Tous',            icon: '🗺️' },
  { key: 'camion',  label: 'Camion',          icon: '🚛' },
  { key: 'prn',     label: 'Points collecte', icon: '♻️'  },
  { key: 'alertes', label: 'Alertes',         icon: '🔔' },
];

const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  Plateau:  { lat: 14.7590, lng: -17.4234 },
  Almadies: { lat: 14.7378, lng: -17.5510 },
  Médina:   { lat: 14.6928, lng: -17.4467 },
};

// ── Icône poubelle custom ─────────────────────────────────────────────────────
function PoubelleIcon() {
  return (
    <View style={markerStyles.wrapper}>
      <View style={markerStyles.pin}>
        <Ionicons name="trash" size={18} color="white" />
      </View>
      <View style={markerStyles.triangle} />
    </View>
  );
}

const markerStyles = StyleSheet.create({
  wrapper:  { alignItems: 'center' },
  pin: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#166534',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: 'white',
    shadowColor: '#000', shadowOpacity: 0.3,
    shadowRadius: 4, elevation: 5,
  },
  triangle: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#166534',
  },
});

// ── FilterBar ─────────────────────────────────────────────────────────────────
type FilterBarProps = {
  activeFilter: Filter;
  alertActive: boolean;
  onFilter: (f: Filter) => void;
};

function FilterBar({ activeFilter, alertActive, onFilter }: FilterBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContent}
    >
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
            onPress={() => onFilter(f.key)}
          >
            <Text style={styles.filterIcon}>{f.icon}</Text>
            <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
              {f.label}
            </Text>
            {f.key === 'alertes' && alertActive && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── MapScreen ─────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const router = useRouter();
  const mapRef          = useRef<any>(null);
  const mapInstanceRef  = useRef<any>(null);
  const routeLayerRef   = useRef<any>(null);
  const truckMarkerRef  = useRef<any>(null);
  const prnLayerRef     = useRef<any[]>([]);
  const userInteracted  = useRef(false);
  const prevAlertActive = useRef(false);

  const [loading, setLoading]           = useState(true);
  const [truckZone, setTruckZone]       = useState<string | null>(null);
  const [citizenPos, setCitizenPos]     = useState<{ lat: number; lng: number } | null>(null);
  const [alertActive, setAlertActive]   = useState(false);
  const [truckPos, setTruckPos]         = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('tous');
  const [visibleCount, setVisibleCount] = useState(5);

  const showTruck   = activeFilter === 'tous' || activeFilter === 'camion';
  const showPRN     = activeFilter === 'tous' || activeFilter === 'prn';
  const showAlertes = activeFilter === 'tous' || activeFilter === 'alertes';
  const visiblePoints = COLLECTE_POINTS.slice(0, visibleCount);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getCitizenLocationMobile();
    } else {
      initMap();
    }
    const interval = setInterval(pollTruck, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') updateLeafletLayers();
  }, [activeFilter, truckPos, citizenPos, visibleCount]);

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
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true; script.onload = () => setupLeaflet();
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
          const icon = L.divIcon({ html: `<div style="font-size:24px;">🏠</div>`, className: '' });
          L.marker([cPos.lat, cPos.lng], { icon }).addTo(map);
          map.setView([cPos.lat, cPos.lng], 14);
          setLoading(false);
        },
        () => setLoading(false)
      );
    }
    pollTruck();
  };

  const updateLeafletLayers = () => {
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    if (!map || !L) return;

    prnLayerRef.current.forEach(l => map.removeLayer(l));
    prnLayerRef.current = [];

    if (showPRN) {
      visiblePoints.forEach(pc => {
        const icon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50%;
            background:#166534;border:2.5px solid white;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;
          ">🗑️</div>`,
          className: '', iconAnchor: [18, 36],
        });
        const marker = L.marker([pc.lat, pc.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <b>${pc.name}</b><br/>Point de collecte<br/>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${pc.lat},${pc.lng}&travelmode=walking"
               target="_blank" style="color:#166534;font-weight:600;">
              🧭 Itinéraire
            </a>
          `);
        prnLayerRef.current.push(marker);
      });
    }

    if (truckMarkerRef.current) { map.removeLayer(truckMarkerRef.current); truckMarkerRef.current = null; }
    if (routeLayerRef.current)  { map.removeLayer(routeLayerRef.current);  routeLayerRef.current = null;  }

    if (showTruck && truckPos) {
      const truckIcon = L.divIcon({
        html: `<div style="font-size:35px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚛</div>`,
        className: '',
      });
      truckMarkerRef.current = L.marker([truckPos.lat, truckPos.lng], { icon: truckIcon }).addTo(map);
      if (citizenPos && showAlertes) {
        routeLayerRef.current = L.polyline(
          [[truckPos.lat, truckPos.lng], [citizenPos.lat, citizenPos.lng]],
          { color: '#166534', weight: 3, dashArray: '10, 10' }
        ).addTo(map);
      }
    }
  };

  const pollTruck = async () => {
    try {
      const token = await getToken();
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/check-alerte`, { headers });
      const data = await response.json();

      if (data.actif) {
        if (!prevAlertActive.current) userInteracted.current = false;
        prevAlertActive.current = true;
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
          if (mapRef.current && Platform.OS !== 'web' && !userInteracted.current) {
            mapRef.current.animateCamera(
              { center: { latitude: pos.lat, longitude: pos.lng }, zoom: 15 },
              { duration: 800 }
            );
          }
          if (Platform.OS === 'web') updateLeafletLayers();
        }
      } else {
        prevAlertActive.current = false;
        setAlertActive(false);
        setTruckPos(null);
        if (Platform.OS === 'web') updateLeafletLayers();
      }
    } catch (e) {
      console.log("Erreur poll:", e);
    }
  };

  // ── Centre carte sur le point ─────────────────────────────────────────────
  const focusPoint = (pc: typeof COLLECTE_POINTS[0]) => {
    if (Platform.OS !== 'web') {
      mapRef.current?.animateCamera(
        { center: { latitude: pc.lat, longitude: pc.lng }, zoom: 15 },
        { duration: 600 }
      );
    } else {
      mapInstanceRef.current?.setView([pc.lat, pc.lng], 15);
    }
  };

  // ── Ouvre Plans/Google Maps avec itinéraire à pied ────────────────────────
  const openItinerary = (pc: typeof COLLECTE_POINTS[0]) => {
    const url = Platform.select({
      ios:     `maps://?daddr=${pc.lat},${pc.lng}&dirflg=w`,
      android: `google.navigation:q=${pc.lat},${pc.lng}&mode=w`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${pc.lat},${pc.lng}&travelmode=walking`,
    });
    Linking.openURL(url!).catch(() =>
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${pc.lat},${pc.lng}`)
    );
  };

  const handleFilterChange = (f: Filter) => {
    setActiveFilter(f);
    setVisibleCount(5);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi en temps réel</Text>
        <TouchableOpacity onPress={pollTruck}>
          <Ionicons name="refresh" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      {/* Bannière */}
      {alertActive && (showTruck || showAlertes) ? (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>🚛 Camion en route vers {truckZone}</Text>
          <Text style={styles.alertSub}>Sortez vos poubelles !</Text>
        </View>
      ) : (
        <View style={styles.inactiveBanner}>
          <Text style={styles.inactiveText}>
            {activeFilter === 'prn'
              ? `♻️ ${visibleCount} / ${COLLECTE_POINTS.length} points de collecte affichés`
              : 'Aucun camion actif en ce moment'}
          </Text>
        </View>
      )}

      {/* Filtres */}
      <FilterBar
        activeFilter={activeFilter}
        alertActive={alertActive}
        onFilter={handleFilterChange}
      />

      {/* Carte + légende */}
      <View style={{ flex: 1, position: 'relative' }}>

        {Platform.OS === 'web' ? (
          <div ref={mapRef} style={{ flex: 1, width: '100%', minHeight: '500px' }} />
        ) : loading ? (
          <View style={styles.noMap}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.noMapText}>Chargement de la carte…</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            onPanDrag={() => { userInteracted.current = true; }}
            onRegionChangeComplete={() => { userInteracted.current = true; }}
            initialRegion={{
              latitude: citizenPos?.lat ?? 14.6937,
              longitude: citizenPos?.lng ?? -17.4441,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Marker citoyen */}
            {citizenPos && (
              <Marker
                coordinate={{ latitude: citizenPos.lat, longitude: citizenPos.lng }}
                title="Ma position"
                pinColor="#166534"
                tracksViewChanges={false}
              />
            )}

            {/* Points de collecte */}
            {showPRN && visiblePoints.map((pc) => (
              <Marker
                key={pc.id}
                coordinate={{ latitude: pc.lat, longitude: pc.lng }}
                title={pc.name}
                description="Appuyez pour l'itinéraire"
                tracksViewChanges={false}
                onCalloutPress={() => openItinerary(pc)}
              >
                <PoubelleIcon />
              </Marker>
            ))}

            {/* Marker camion */}
            {showTruck && truckPos && (
              <Marker
                key={`truck-${truckPos.lat}-${truckPos.lng}`}
                coordinate={{ latitude: truckPos.lat, longitude: truckPos.lng }}
                title={`🚛 Camion — ${truckZone}`}
                tracksViewChanges={false}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 36 }}>🚛</Text>
                  <View style={styles.truckLabel}>
                    <Text style={styles.truckLabelText}>{truckZone}</Text>
                  </View>
                </View>
              </Marker>
            )}

            {/* Ligne camion → citoyen */}
            {showAlertes && truckPos && citizenPos && (
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

        {/* Légende superposée */}
        {showPRN && Platform.OS !== 'web' && (
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>
              ♻️ Points de collecte ({visibleCount}/{COLLECTE_POINTS.length})
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 130 }}>
              {visiblePoints.map((pc) => (
                <View key={pc.id} style={styles.legendItem}>
                  {/* Tap nom → centre carte */}
                  <TouchableOpacity
                    style={styles.legendLeft}
                    onPress={() => focusPoint(pc)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.legendDot}>
                      <Ionicons name="trash" size={12} color="white" />
                    </View>
                    <Text style={styles.legendText} numberOfLines={1}>{pc.name}</Text>
                  </TouchableOpacity>
                  {/* Tap 🧭 → ouvre itinéraire */}
                  <TouchableOpacity
                    style={styles.itineraryBtn}
                    onPress={() => openItinerary(pc)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="navigate" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Charger plus */}
            {visibleCount < COLLECTE_POINTS.length ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => setVisibleCount(prev => Math.min(prev + 10, COLLECTE_POINTS.length))}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={16} color="#166534" />
                <Text style={styles.loadMoreText}>
                  Charger {Math.min(10, COLLECTE_POINTS.length - visibleCount)} points de plus
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.allLoadedRow}>
                <Ionicons name="checkmark-circle" size={14} color="#166534" />
                <Text style={styles.allLoadedText}>Tous les points affichés</Text>
              </View>
            )}
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F7FBF7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },

  alertBanner:    { backgroundColor: '#f59e0b', padding: 12, paddingHorizontal: 16 },
  alertText:      { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  alertSub:       { color: 'white', fontSize: 11, textAlign: 'center', marginTop: 2, opacity: 0.9 },
  inactiveBanner: {
    backgroundColor: '#f0fdf4', padding: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#dcfce7',
  },
  inactiveText: { color: '#166534', fontSize: 13, textAlign: 'center' },

  filterScroll:  { maxHeight: 56, backgroundColor: '#fff' },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#e2e8f0', backgroundColor: '#f8fafc',
    position: 'relative',
  },
  filterChipActive:  { borderColor: '#166534', backgroundColor: '#f0fdf4' },
  filterIcon:        { fontSize: 14 },
  filterLabel:       { fontSize: 13, fontWeight: '500', color: '#64748b' },
  filterLabelActive: { color: '#166534', fontWeight: '700' },
  filterBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444',
  },

  map:       { flex: 1 },
  noMap:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noMapText: { fontSize: 16, color: '#94a3b8' },

  truckLabel:     { backgroundColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  truckLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },

  legend: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    backgroundColor: 'white', borderRadius: 16, padding: 12,
    elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  legendTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  legendItem:  {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    gap: 6,
  },
  legendLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1,
  },
  legendDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#166534',
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  legendText:   { fontSize: 12, color: '#1e293b', fontWeight: '500', flex: 1 },
  itineraryBtn: {
    backgroundColor: '#166534', borderRadius: 8,
    padding: 6, flexShrink: 0,
  },
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 8, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  loadMoreText:  { fontSize: 12, color: '#166534', fontWeight: '600' },
  allLoadedRow:  {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginTop: 8, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  allLoadedText: { fontSize: 11, color: '#166534', fontWeight: '500' },
});