import { useRouter } from "expo-router";
import { ArrowLeft, Navigation, ZoomIn, ZoomOut } from "lucide-react-native";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Design";
import { MOCK_TRUCK_LOCATION } from "../constants/mockData";

export default function MapScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      {/* 1. Header flottant */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Suivi en direct</Text>
          <Text style={styles.headerSubtitle}>Secteur A — Nord</Text>
        </View>
      </View>

      {/* 2. Zone de la Carte (Simulation visuelle) */}
      <View style={styles.mapContainer}>
        {/* On simule une grille de carte */}
        <View style={styles.gridOverlay} />
        
        {/* Le Camion (Marqueur) */}
        <View style={styles.markerContainer}>
          <View style={styles.pulseRing} />
          <View style={styles.truckMarker}>
            <Navigation 
              color={Colors.white} 
              size={20} 
              style={{ transform: [{ rotate: '45deg' }] }} 
            />
          </View>
          <View style={styles.markerLabel}>
            <Text style={styles.markerLabelText}>Camion TRK-204</Text>
            <Text style={styles.markerSubText}>{MOCK_TRUCK_LOCATION.speed} km/h</Text>
          </View>
        </View>
      </View>

      {/* 3. Contrôles de la carte */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn}>
          <ZoomIn color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn}>
          <ZoomOut color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
      </View>

      {/* 4. Carte d'info basse */}
      <View style={styles.bottomCard}>
        <View style={styles.infoLine}>
          <Text style={styles.infoLabel}>Dernière mise à jour :</Text>
          <Text style={styles.infoValue}>Il y a 2 sec</Text>
        </View>
        <Text style={styles.infoDescription}>
          Le camion se dirige vers l'arrêt n°8 (Rue de la République).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 15,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  headerSubtitle: { color: Colors.textMuted, fontSize: 12 },
  mapContainer: {
    flex: 1,
    backgroundColor: '#0a0d12', // Un bleu encore plus sombre pour la carte
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    borderWidth: 1,
    borderColor: Colors.border,
    // Simule une grille
    backgroundColor: 'transparent',
  },
  markerContainer: { alignItems: 'center' },
  truckMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: Colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentDim,
    borderWidth: 1,
    borderColor: Colors.accentSoft,
  },
  markerLabel: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  markerLabelText: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  markerSubText: { color: Colors.accent, fontSize: 10, fontWeight: 'bold' },
  controls: {
    position: 'absolute',
    right: 20,
    top: '40%',
    gap: 10,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { color: Colors.textMuted, fontSize: 12 },
  infoValue: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  infoDescription: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
});
