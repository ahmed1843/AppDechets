import { useRouter } from 'expo-router';
import { Award, ChevronRight, LogOut, Settings, User } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header Profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User color="white" size={40} />
          </View>
          <TouchableOpacity style={styles.editBadge}>
            <Settings color="white" size={14} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Jean Recyclage</Text>
        <Text style={styles.userEmail}>jean@exemple.com</Text>
      </View>

      {/* Carte des points */}
      <View style={styles.pointsCard}>
        <View style={styles.pointsInfo}>
          <Award color="#fbbf24" size={32} />
          <View>
            <Text style={styles.pointsTitle}>Niveau Argent</Text>
            <Text style={styles.pointsSub}>150 points cumulés</Text>
          </View>
        </View>
        <Text style={styles.pointsValue}>150</Text>
      </View>

      {/* Menu d'options style Tailwind */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#f1f5f9' }]}>
            <Settings color="#64748b" size={20} />
          </View>
          <Text style={styles.menuText}>Paramètres du compte</Text>
          <ChevronRight color="#cbd5e1" size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={() => router.replace('/')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#fef2f2' }]}>
            <LogOut color="#ef4444" size={20} />
          </View>
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Se déconnecter</Text>
          <ChevronRight color="#fecaca" size={20} />
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0 (Bêta)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'white', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { backgroundColor: '#22c55e', padding: 20, borderRadius: 30 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1e293b', padding: 6, borderRadius: 10, borderWidth: 3, borderColor: 'white' },
  userName: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  userEmail: { color: '#64748b', fontSize: 14, marginTop: 4 },
  
  pointsCard: { 
    margin: 24, 
    backgroundColor: '#1e293b', 
    borderRadius: 20, 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  pointsInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  pointsTitle: { color: 'white', fontWeight: '700', fontSize: 16 },
  pointsSub: { color: '#94a3b8', fontSize: 12 },
  pointsValue: { color: '#fbbf24', fontSize: 28, fontWeight: '900' },

  menuSection: { backgroundColor: 'white', marginHorizontal: 24, borderRadius: 20, padding: 8, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 15 },
  iconCircle: { padding: 10, borderRadius: 12 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#334155' },
  version: { textAlign: 'center', marginTop: 30, color: '#cbd5e1', fontSize: 12, marginBottom: 40 }
});
