import { FontAwesome } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

// --- DONNÉES DES POINTS DE COLLECTE ---
const POINTS = [
  { id: 1, nom: "Point Vert - Plateau", type: "Verre/Plastique", dist: "450m", color: "#22c55e" },
  { id: 2, nom: "Déchetterie Mobile", type: "Tout type", dist: "1.2km", color: "#166534" },
  { id: 3, nom: "Bac Collectif - Médina", type: "Papier", dist: "2.5km", color: "#3b82f6" },
];

export default function CarteScreen() {
  const navigation = useNavigation();
  const [selectedPoint, setSelectedPoint] = useState(POINTS[0]);

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <FontAwesome name="navicon" size={24} color="#166534" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Points de collecte</Text>
        <Search size={22} color="#166534" />
      </View>

      {/* ZONE CARTE (SIMULÉE) */}
      <View style={styles.mapMock}>
        <View style={styles.mapOverlay}>
          {/* On simule des marqueurs sur la carte */}
          <MapPin size={40} color="#ef4444" style={styles.marker1} />
          <MapPin size={40} color="#22c55e" style={styles.marker2} />
          <MapPin size={40} color="#3b82f6" style={styles.marker3} />
        </View>
        <View style={styles.webBadge}>
           <Text style={styles.webBadgeText}>📍 Vue interactive activée</Text>
        </View>
      </View>

      {/* LISTE DES POINTS (CARROUSEL DU BAS) */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Points à proximité</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {POINTS.map((item) => (
            <TouchableOpacity 
                key={item.id} 
                style={[styles.pointCard, selectedPoint.id === item.id && styles.activeCard]}
                onPress={() => setSelectedPoint(item)}
            >
              <View style={[styles.typeIcon, { backgroundColor: item.color }]}>
                <Navigation size={18} color="white" />
              </View>
              <Text style={styles.pointNom}>{item.nom}</Text>
              <Text style={styles.pointType}>{item.type}</Text>
              <View style={styles.distBadge}>
                <Text style={styles.distText}>{item.dist}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* BOUTON D'ACTION POUR LE POINT SÉLECTIONNÉ */}
        <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>S'y rendre avec GPS</Text>
            <Navigation size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: 'white' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  
  // Simulation de carte avec un fond gris/vert léger
  mapMock: { flex: 1, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  mapOverlay: { position: 'relative', width: '100%', height: '100%' },
  marker1: { position: 'absolute', top: '30%', left: '40%' },
  marker2: { position: 'absolute', top: '50%', left: '60%' },
  marker3: { position: 'absolute', top: '70%', left: '20%' },
  
  webBadge: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 20, elevation: 3 },
  webBadgeText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },

  listContainer: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, marginTop: -30 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 15 },
  scroll: { marginBottom: 20 },
  pointCard: { 
    width: 160, padding: 15, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 15, borderWidth: 2, borderColor: 'transparent' 
  },
  activeCard: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  typeIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  pointNom: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  pointType: { color: '#64748b', fontSize: 12, marginTop: 4 },
  distBadge: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  distText: { fontSize: 10, fontWeight: 'bold', color: '#166534' },

  navButton: { 
    backgroundColor: '#166534', padding: 18, borderRadius: 15, flexDirection: 'row', 
    justifyContent: 'center', alignItems: 'center' 
  },
  navButtonText: { color: 'white', fontWeight: 'bold', marginRight: 10 }
});
