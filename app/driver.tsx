import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DARK_COLORS = {
  bg: '#0f172a',      // Bleu-noir profond
  card: '#1e293b',    // Gris-bleu ardoise
  accent: '#22c55e',  // Vert néon (Identité EcoWaste)
  text: '#f8fafc',    // Blanc cassé
  muted: '#94a3b8',   // Gris bleuâtre
  warning: '#f59e0b', // Ambre pour les alertes
  danger: '#ef4444'   // Rouge pour les urgences
};

export default function DriverDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // On pourrait ajouter ici la logique pour supprimer le token
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Bonjour, Chauffeur</Text>
            <Text style={styles.truckId}>Camion #DK-2024-05</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={DARK_COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* --- CARTE DE STATUT TEMPS RÉEL --- */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <View style={styles.iconBg}>
              <Ionicons name="navigate-circle" size={32} color={DARK_COLORS.accent} />
            </View>
            <View style={{marginLeft: 15}}>
              <Text style={styles.statusLabel}>Zone de collecte actuelle</Text>
              <Text style={styles.statusValue}>Médina, Secteur 4</Text>
            </View>
          </View>
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>EN SERVICE</Text>
          </View>
        </View>

        {/* --- STATISTIQUES VÉHICULE --- */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="funnel-outline" size={20} color={DARK_COLORS.accent} />
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Remplissage</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="location-outline" size={20} color={DARK_COLORS.accent} />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Points restants</Text>
          </View>
        </View>

        {/* --- SECTION ALERTES --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alertes Citoyennes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        
        {/* Alerte 1 */}
        <TouchableOpacity style={styles.alertItem}>
          <View style={[styles.alertIcon, {backgroundColor: 'rgba(245, 158, 11, 0.1)'}]}>
            <Ionicons name="warning" size={24} color={DARK_COLORS.warning} />
          </View>
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.alertText}>Dépôt sauvage signalé</Text>
            <Text style={styles.alertSub}>Rue 10 x Blaise Diagne</Text>
          </View>
          <Text style={styles.alertTime}>Il y a 5 min</Text>
        </TouchableOpacity>

        {/* Alerte 2 */}
        <TouchableOpacity style={styles.alertItem}>
          <View style={[styles.alertIcon, {backgroundColor: 'rgba(34, 197, 94, 0.1)'}]}>
            <Ionicons name="trash-bin" size={24} color={DARK_COLORS.accent} />
          </View>
          <View style={{flex: 1, marginLeft: 15}}>
            <Text style={styles.alertText}>Bac plein (RFID)</Text>
            <Text style={styles.alertSub}>Face Cinéma El Mansour</Text>
          </View>
          <Text style={styles.alertTime}>Il y a 12 min</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- BARRE D'ACTION BASSE --- */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => router.push('/map')} // On pourra lier ta carte ici
        >
          <Ionicons name="map" size={22} color="#000" />
          <Text style={styles.mainButtonText}>Lancer l'itinéraire GPS</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: DARK_COLORS.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  scrollContent: { padding: 20, paddingBottom: 110 },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30, 
    marginTop: 10 
  },
  welcomeText: { color: DARK_COLORS.muted, fontSize: 14, fontWeight: '500' },
  truckId: { color: DARK_COLORS.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  logoutBtn: { 
    padding: 12, 
    backgroundColor: DARK_COLORS.card, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },

  statusCard: { 
    backgroundColor: DARK_COLORS.card, 
    padding: 20, 
    borderRadius: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { 
    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
    padding: 10, 
    borderRadius: 15 
  },
  statusLabel: { color: DARK_COLORS.muted, fontSize: 12, marginBottom: 2 },
  statusValue: { color: DARK_COLORS.text, fontSize: 18, fontWeight: 'bold' },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: DARK_COLORS.accent, 
    marginRight: 6 
  },
  badgeText: { color: DARK_COLORS.accent, fontSize: 10, fontWeight: '900' },

  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 35 },
  statBox: { 
    flex: 1, 
    backgroundColor: DARK_COLORS.card, 
    padding: 20, 
    borderRadius: 24, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  statNumber: { color: DARK_COLORS.text, fontSize: 28, fontWeight: '900', marginTop: 10 },
  statLabel: { color: DARK_COLORS.muted, fontSize: 12, marginTop: 4 },

  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionTitle: { color: DARK_COLORS.text, fontSize: 20, fontWeight: 'bold' },
  seeAll: { color: DARK_COLORS.accent, fontSize: 14, fontWeight: '600' },

  alertItem: { 
    backgroundColor: DARK_COLORS.card, 
    padding: 18, 
    borderRadius: 22, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)'
  },
  alertIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  alertText: { color: DARK_COLORS.text, fontWeight: 'bold', fontSize: 16 },
  alertSub: { color: DARK_COLORS.muted, fontSize: 13, marginTop: 2 },
  alertTime: { color: DARK_COLORS.muted, fontSize: 10, alignSelf: 'flex-start' },

  bottomActions: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20 
  },
  mainButton: { 
    backgroundColor: DARK_COLORS.accent, 
    height: 70, 
    borderRadius: 22, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    shadowColor: DARK_COLORS.accent, 
    shadowOpacity: 0.4, 
    shadowRadius: 15, 
    elevation: 12
  },
  mainButtonText: { color: '#000', fontSize: 18, fontWeight: '900' }
});
