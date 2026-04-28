import { FontAwesome } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Award, Bell, Leaf, LogOut } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <FontAwesome name="navicon" size={24} color="#166534" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.userName}>Moussa Diop</Text>
        <Text style={styles.userEmail}>moussa.diop@ecowaste.com</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Award color="#ca8a04" size={20} />
            <Text style={styles.statValue}>150</Text>
            <Text style={styles.statLabel}>Points Eco</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
            <Leaf color="#22c55e" size={20} />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}><Bell size={20} color="#64748b" /><Text style={styles.settingLabel}>Notifications</Text></View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: "#cbd5e1", true: "#166534" }} />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  profileCard: { backgroundColor: 'white', margin: 20, borderRadius: 25, padding: 20, alignItems: 'center', elevation: 2 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  userEmail: { color: '#64748b', marginBottom: 20 },
  statsRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 5 },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  section: { paddingHorizontal: 20, marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 15 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  settingLabel: { fontSize: 15, color: '#334155', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, gap: 10 },
  logoutText: { color: '#ef4444', fontWeight: 'bold' }
});
