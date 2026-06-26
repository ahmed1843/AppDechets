import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
let UrlTile: any = null;
let Callout: any = null;

if (Platform.OS !== 'web') {
  try {
    const RNMaps = require('react-native-maps');
    MapView  = RNMaps.default;
    Marker   = RNMaps.Marker;
    Polyline = RNMaps.Polyline;
    UrlTile  = RNMaps.UrlTile;
    Callout  = RNMaps.Callout;
  } catch (e) {
    console.log('react-native-maps non disponible sur web');
  }
}

const COLLECTE_POINTS = [
  { id: 'pc1',  name: 'Collecte Plateau Sandaga',     quartier: 'Plateau',    lat: 14.6741, lng: -17.4366 },
  { id: 'pc2',  name: 'Collecte Plateau HLM',         quartier: 'Plateau',    lat: 14.6960, lng: -17.4445 },
  { id: 'pc3',  name: 'Collecte Médina Centre',       quartier: 'Médina',     lat: 14.6928, lng: -17.4467 },
  { id: 'pc4',  name: 'Collecte Médina Rue 10',       quartier: 'Médina',     lat: 14.6890, lng: -17.4410 },
  { id: 'pc5',  name: 'Collecte Almadies Rond-point', quartier: 'Almadies',   lat: 14.7378, lng: -17.5010 },
  { id: 'pc6',  name: 'Collecte Ouakam Mosquée',      quartier: 'Ouakam',     lat: 14.7285, lng: -17.4890 },
  { id: 'pc7',  name: 'Collecte Ngor Village',        quartier: 'Ngor',       lat: 14.7450, lng: -17.5150 },
  { id: 'pc8',  name: 'Collecte Parcelles Assainies', quartier: 'Parcelles',  lat: 14.7569, lng: -17.4347 },
  { id: 'pc9',  name: 'Collecte Grand Yoff',          quartier: 'Grand Yoff', lat: 14.7350, lng: -17.4500 },
  { id: 'pc10', name: 'Collecte Camberène',           quartier: 'Camberène',  lat: 14.7650, lng: -17.4300 },
  { id: 'pc11', name: 'Collecte Guédiawaye Marché',   quartier: 'Guédiawaye', lat: 14.7720, lng: -17.4050 },
  { id: 'pc12', name: 'Collecte Pikine Icotaf',       quartier: 'Pikine',     lat: 14.7550, lng: -17.3900 },
  { id: 'pc13', name: 'Collecte Pikine Terminus',     quartier: 'Pikine',     lat: 14.7480, lng: -17.3800 },
  { id: 'pc14', name: 'Collecte Yoff Village',        quartier: 'Yoff',       lat: 14.7530, lng: -17.4980 },
  { id: 'pc15', name: 'Collecte Rufisque Centre',     quartier: 'Rufisque',   lat: 14.7157, lng: -17.2728 },
];

const ZONE_COORDS: Record<string, { lat: number; lng: number }> = {
  Plateau:  { lat: 14.7590, lng: -17.4234 },
  Almadies: { lat: 14.7378, lng: -17.5510 },
  Médina:   { lat: 14.6928, lng: -17.4467 },
};

type Filter = 'tous' | 'prn';

// ── Marqueur pin rond ─────────────────────────────────────────────────────────
function PoubelleMarker() {
  return (
    <View style={markerStyles.wrapper}>
      <View style={markerStyles.circle}>
        <View style={markerStyles.innerCircle}>
          <Text style={markerStyles.emoji}>♻️</Text>
        </View>
      </View>
      <View style={markerStyles.pointer} />
    </View>
  );
}

const markerStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 8,
  },
  circle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'white',
    borderWidth: 3, borderColor: '#166534',
    justifyContent: 'center', alignItems: 'center',
  },
  innerCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center', alignItems: 'center',
  },
  emoji: { fontSize: 22 },
  pointer: {
    width: 0, height: 0,
    borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#166534',
    marginTop: -1,
  },
});

// ── MapScreen ─────────────────────────────────────────────────────────────────
export default function MapScreen() {
  const router = useRouter();
  const mapRef         = useRef<any>(null);
  const userInteracted = useRef(false);
  const prevAlert      = useRef(false);

  const [loading, setLoading]           = useState(true);
  const [citizenPos, setCitizenPos]     = useState<{ lat: number; lng: number } | null>(null);
  const [alertActive, setAlertActive]   = useState(false);
  const [truckZone, setTruckZone]       = useState<string | null>(null);
  const [truckPos, setTruckPos]         = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('tous');

  // ✅ FIX Android — marqueurs custom nécessitent tracksViewChanges=true au début
  const [markersReady, setMarkersReady] = useState(false);

  // Bottom sheet
  const [sheetOpen, setSheetOpen] = useState(true);
  const sheetAnim = useRef(new Animated.Value(1)).current;

  const showPRN = activeFilter === 'tous' || activeFilter === 'prn';

  const toggleSheet = () => {
    const toValue = sheetOpen ? 0 : 1;
    Animated.spring(sheetAnim, { toValue, useNativeDriver: false, friction: 8 }).start();
    setSheetOpen(!sheetOpen);
  };

  useEffect(() => {
    getCitizenLocation();
    const interval = setInterval(pollTruck, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCitizenLocation = async () => {
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCitizenPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch (e) {
      console.log("Erreur géoloc:", e);
    } finally {
      setLoading(false);
      pollTruck();
    }
  };

  const centerOnUser = () => {
    if (!citizenPos || !mapRef.current) return;
    mapRef.current.animateCamera(
      { center: { latitude: citizenPos.lat, longitude: citizenPos.lng }, zoom: 14 },
      { duration: 600 }
    );
  };

  const pollTruck = async () => {
    try {
      const token = await getToken();
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res  = await fetch(`${API_URL}/check-alerte`, { headers });
      const data = await res.json();

      if (data.actif) {
        if (!prevAlert.current) userInteracted.current = false;
        prevAlert.current = true;
        setAlertActive(true);
        setTruckZone(data.zone);
        const pos = data.zone && ZONE_COORDS[data.zone] ? ZONE_COORDS[data.zone] : null;
        if (pos) {
          setTruckPos(pos);
          if (mapRef.current && !userInteracted.current) {
            mapRef.current.animateCamera(
              { center: { latitude: pos.lat, longitude: pos.lng }, zoom: 15 },
              { duration: 800 }
            );
          }
        }
      } else {
        prevAlert.current = false;
        setAlertActive(false);
        setTruckPos(null);
      }
    } catch (e) {
      console.log("Erreur poll:", e);
    }
  };

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

  const focusPoint = (pc: typeof COLLECTE_POINTS[0]) => {
    mapRef.current?.animateCamera(
      { center: { latitude: pc.lat, longitude: pc.lng }, zoom: 16 },
      { duration: 600 }
    );
    if (sheetOpen) {
      Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: false, friction: 8 }).start();
      setSheetOpen(false);
    }
  };

  const sheetHeight = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [56, 260],
  });

  return (
    <View style={styles.root}>

      {/* Masque le header natif Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── CARTE PLEIN ÉCRAN ─────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.loadingText}>Chargement de la carte…</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          onPanDrag={() => { userInteracted.current = true; }}
          onRegionChangeComplete={() => { userInteracted.current = true; }}
          // ✅ FIX — onMapReady : active les marqueurs après 500ms
          onMapReady={() => {
            setTimeout(() => setMarkersReady(true), 500);
          }}
        initialRegion={{
  latitude:       14.6937,   // Dakar Plateau — zone principale
  longitude:      -17.4441,
  latitudeDelta:  0.06,
  longitudeDelta: 0.06,
}}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Tuiles Carto Voyager */}
          {UrlTile && (
            <UrlTile
              urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
          )}

          {/* ── Épingles points de collecte ── */}
          {showPRN && COLLECTE_POINTS.map((pc) => (
            <Marker
              key={pc.id}
              coordinate={{ latitude: pc.lat, longitude: pc.lng }}
              // ✅ FIX Android — true jusqu'à ce que la carte soit prête
              tracksViewChanges={!markersReady}
            >
              <PoubelleMarker />

              {Callout && (
                <Callout tooltip onPress={() => openItinerary(pc)}>
                  <View style={calloutStyles.box}>
                    <View style={calloutStyles.header}>
                      <View style={calloutStyles.iconBox}>
                        <Text style={{ fontSize: 13 }}>♻️</Text>
                      </View>
                      <Text style={calloutStyles.title} numberOfLines={2}>
                        {pc.name}
                      </Text>
                    </View>
                    <View style={calloutStyles.tagRow}>
                      <View style={calloutStyles.tag}>
                        <Ionicons name="location" size={10} color="#166534" />
                        <Text style={calloutStyles.tagText}>{pc.quartier} · Dakar</Text>
                      </View>
                      <View style={calloutStyles.tag}>
                        <Ionicons name="refresh-circle" size={10} color="#166534" />
                        <Text style={calloutStyles.tagText}>Collecte fixe</Text>
                      </View>
                    </View>
                    <View style={calloutStyles.btn}>
                      <Ionicons name="navigate" size={12} color="white" />
                      <Text style={calloutStyles.btnText}>Itinéraire à pied</Text>
                    </View>
                    <View style={calloutStyles.arrow} />
                  </View>
                </Callout>
              )}
            </Marker>
          ))}

          {/* Camion — position indicative si alerte active */}
          {truckPos && (
            <Marker
              coordinate={{ latitude: truckPos.lat, longitude: truckPos.lng }}
              tracksViewChanges={false}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 34 }}>🚛</Text>
                <View style={styles.truckBadge}>
                  <Text style={styles.truckBadgeText}>{truckZone}</Text>
                </View>
              </View>
            </Marker>
          )}

          {/* Ligne camion → citoyen */}
          {truckPos && citizenPos && (
            <Polyline
              coordinates={[
                { latitude: truckPos.lat,   longitude: truckPos.lng },
                { latitude: citizenPos.lat, longitude: citizenPos.lng },
              ]}
              strokeColor="#166534"
              strokeWidth={3}
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>
      )}

      {/* ── HEADER FLOTTANT ──────────────────────────────────────────── */}
      <SafeAreaView style={styles.headerSafe} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SAMA GOX</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={centerOnUser}>
            <Ionicons name="locate" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filtres pills */}
        <View style={styles.filtersRow}>
          {(['tous', 'prn'] as Filter[]).map((f) => {
            const isActive = activeFilter === f;
            const label    = f === 'tous' ? 'Tous' : 'Points collecte';
            return (
              <TouchableOpacity
                key={f}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveFilter(f)}
              >
                {isActive && (
                  <Ionicons name="checkmark" size={13} color="#166534" style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}

          {alertActive && (
            <View style={styles.pillAlert}>
              <Ionicons name="warning" size={13} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.pillAlertText}>Alerte — {truckZone}</Text>
            </View>
          )}
        </View>

        {/* Compteur épingles */}
        {showPRN && (
          <View style={styles.countBadge}>
            <Ionicons name="pin" size={12} color="#166534" />
            <Text style={styles.countText}>
              {COLLECTE_POINTS.length} points affichés sur la carte
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* ── BOTTOM SHEET ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, { height: sheetHeight }]}>

        <TouchableOpacity style={styles.sheetHeader} onPress={toggleSheet} activeOpacity={0.8}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>
              ♻️ POINTS DE COLLECTE ({COLLECTE_POINTS.length})
            </Text>
            <Ionicons
              name={sheetOpen ? "chevron-down" : "chevron-up"}
              size={20}
              color="#166534"
            />
          </View>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {COLLECTE_POINTS.map((pc, index) => (
            <View key={pc.id}>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => focusPoint(pc)}
                activeOpacity={0.7}
              >
                <View style={styles.sheetItemLeft}>
                  <View style={styles.sheetDot}>
                    <Ionicons name="location" size={14} color="#166534" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetItemText} numberOfLines={1}>{pc.name}</Text>
                    <Text style={styles.sheetItemSub}>{pc.quartier} · Dakar</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => openItinerary(pc)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="navigate" size={14} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
              {index < COLLECTE_POINTS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </ScrollView>

        <View style={styles.sheetFooter}>
          <Ionicons name="checkmark-circle" size={13} color="#166534" />
          <Text style={styles.sheetFooterText}>
            {COLLECTE_POINTS.length} points chargés · Dakar
          </Text>
        </View>
      </Animated.View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#e8f5e9' },
  loadingBox:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 15, color: '#94a3b8' },

  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: '#166534', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: 'white', letterSpacing: 1.5 },

  filtersRow: {
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    marginHorizontal: 16, marginTop: 10,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  pillActive:     { backgroundColor: '#f0fdf4', borderColor: '#166534' },
  pillText:       { fontSize: 13, fontWeight: '600', color: '#64748b' },
  pillTextActive: { color: '#166534' },
  pillAlert: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f59e0b', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  pillAlertText: { fontSize: 13, fontWeight: '700', color: 'white' },

  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: 'white', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  countText: { fontSize: 12, color: '#166534', fontWeight: '600' },

  truckBadge: {
    backgroundColor: '#f59e0b', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2, marginTop: 2,
  },
  truckBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },

  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 16,
    overflow: 'hidden',
  },
  sheetHeader:   { alignItems: 'center', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 20 },
  sheetHandle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', marginBottom: 10 },
  sheetTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  sheetTitle:    { fontSize: 13, fontWeight: '800', color: '#1e293b', letterSpacing: 0.5 },

  sheetItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 11,
  },
  sheetItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sheetDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#dcfce7',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  sheetItemText: { fontSize: 13, color: '#1e293b', fontWeight: '600' },
  sheetItemSub:  { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  navBtn: {
    backgroundColor: '#166534', borderRadius: 8, padding: 7, flexShrink: 0,
  },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 20 },

  sheetFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fafafa',
  },
  sheetFooterText: { fontSize: 11, color: '#166534', fontWeight: '600' },
});

// ── Styles callout ────────────────────────────────────────────────────────────
const calloutStyles = StyleSheet.create({
  box: {
    backgroundColor: '#166534',
    borderRadius: 14, padding: 12,
    minWidth: 175, maxWidth: 215,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, elevation: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8,
  },
  iconBox: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  title: {
    color: 'white', fontWeight: '700', fontSize: 13, flex: 1, lineHeight: 18,
  },
  tagRow:  { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3,
  },
  tagText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '500' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8, paddingVertical: 7,
  },
  btnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  arrow: {
    position: 'absolute', bottom: -9, alignSelf: 'center',
    width: 0, height: 0,
    borderLeftWidth: 9, borderRightWidth: 9, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#166534',
  },
});