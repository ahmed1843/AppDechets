import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Colors } from "../constants/Design";

// Simulation de données de signalements pour l'admin
const PENDING_REPORTS = [
  { id: '1', loc: 'Rue des Jardins', type: 'Dépôt sauvage', status: 'warning', time: '10 min' },
  { id: '2', loc: 'Avenue Malick Sy', type: 'Poubelle pleine', status: 'error', time: '25 min' },
  { id: '3', loc: 'Point E', type: 'Encombrants', status: 'idle', time: '1h' },
];

export default function AdminScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Console Admin</Text>
        <TouchableOpacity style={styles.statsIcon}>
          <Ionicons name="stats-chart" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Résumé rapide */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>12</Text>
            <Text style={styles.summaryLab}>Alertes</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryVal}>5</Text>
            <Text style={styles.summaryLab}>Camions</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryVal, {color: Colors.accent}]}>85%</Text>
            <Text style={styles.summaryLab}>Propreté</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Signalements à traiter</Text>
        
        {PENDING_REPORTS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.ticket}>
            <View style={styles.ticketHeader}>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={16} color={Colors.accent} />
                <Text style={styles.locationText}>{item.loc}</Text>
              </View>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            
            <Text style={styles.typeText}>{item.type}</Text>
            
            <View style={styles.ticketFooter}>
              <StatusBadge status={item.status as any} label={item.status === 'warning' ? 'Urgent' : 'En attente'} />
              <TouchableOpacity style={styles.assignBtn}>
                <Text style={styles.assignText}>Assigner</Text>
                <Ionicons name="send" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800' },
  statsIcon: { backgroundColor: Colors.surface, padding: 10, borderRadius: 12 },
  container: { padding: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  summaryBox: { flex: 1, backgroundColor: Colors.surface, padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  summaryVal: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  summaryLab: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 15 },
  ticket: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: Colors.border },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 15 },
  timeText: { color: Colors.textMuted, fontSize: 12 },
  typeText: { color: Colors.textSecondary, fontSize: 14, marginBottom: 15 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assignBtn: { backgroundColor: Colors.accent, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  assignText: { color: 'white', fontWeight: '700', fontSize: 13 },
});
