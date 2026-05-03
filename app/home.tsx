import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CitizenHome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour, Mohamed !</Text>
            <Text style={styles.subGreeting}>Rendons Dakar plus propre ensemble.</Text>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.replace('/')}>
             <Ionicons name="person-circle-outline" size={35} color="#166534" />
          </TouchableOpacity>
        </View>

        {/* --- RECHERCHE --- */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Trouver un point de collecte..." 
            style={styles.searchInput}
          />
        </View>

        {/* --- BANNIÈRE ACTION --- */}
        <TouchableOpacity 
          style={styles.banner}
          onPress={() => router.push('/report')}
        >
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Un dépôt sauvage ?</Text>
            <Text style={styles.bannerSub}>Signalez-le en 2 secondes</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="camera" size={30} color="white" />
          </View>
        </TouchableOpacity>

        {/* --- SERVICES --- */}
        <Text style={styles.sectionTitle}>Nos Services</Text>
        <View style={styles.servicesGrid}>
          <TouchableOpacity style={styles.serviceCard}>
            <View style={[styles.serviceIcon, {backgroundColor: '#dcfce7'}]}>
              <Ionicons name="map-outline" size={24} color="#166534" />
            </View>
            <Text style={styles.serviceLabel}>Points de collecte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={[styles.serviceIcon, {backgroundColor: '#fef9c3'}]}>
              <Ionicons name="calendar-outline" size={24} color="#a16207" />
            </View>
            <Text style={styles.serviceLabel}>Horaires passage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={[styles.serviceIcon, {backgroundColor: '#dbeafe'}]}>
              <Ionicons name="leaf-outline" size={24} color="#1e40af" />
            </View>
            <Text style={styles.serviceLabel}>Guide de tri</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard}>
            <View style={[styles.serviceIcon, {backgroundColor: '#fce7f3'}]}>
              <Ionicons name="ribbon-outline" size={24} color="#9d174d" />
            </View>
            <Text style={styles.serviceLabel}>Mes Points</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- TAB BAR SIMPLE (Optionnelle) --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#166534" />
          <Text style={[styles.navText, {color: '#166534'}]}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/report')}>
          <View style={styles.fab}>
             <Ionicons name="add" size={30} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="notifications-outline" size={24} color="#64748b" />
          <Text style={styles.navText}>Alertes</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
bannerTextContainer: {
  flex: 1, // Permet au texte de prendre l'espace disponible
},
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  subGreeting: { fontSize: 14, color: '#64748b' },
  profileBtn: { padding: 5 },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 25
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 16 },
  banner: { 
    backgroundColor: '#166534', 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 30
  },
  bannerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: '#dcfce7', fontSize: 13, marginTop: 2 },
  bannerIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  serviceCard: { 
    width: '47%', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  serviceIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  serviceLabel: { fontSize: 12, fontWeight: '600', color: '#475569', textAlign: 'center' },
  bottomNav: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 80, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 10, color: '#64748b', marginTop: 4 },
  fab: { 
    backgroundColor: '#22c55e', 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: -40,
    elevation: 5,
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowRadius: 10
  }
});
