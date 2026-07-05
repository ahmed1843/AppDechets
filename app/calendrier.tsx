import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, RefreshControl,
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, Platform,
} from "react-native";
import { API_URL } from '../services/api';

interface Zone     { id: number; name: string; }
interface Schedule { id: number; zone_id: number; day_of_week: string; pickup_time: string; truck_name?: string; zone?: Zone; }

const DAY_ORDER: Record<string, number> = {
  Lundi: 1, Mardi: 2, Mercredi: 3, Jeudi: 4, Vendredi: 5, Samedi: 6, Dimanche: 7,
};

// 🎨 Palette harmonisée
const DAY_COLORS: Record<string, string> = {
  Lundi:    '#475569', // Bleu ardoise — neutre pro
  Mardi:    '#f59e0b', // Orange
  Mercredi: '#166534', // Vert SAMA GOX
  Jeudi:    '#3b82f6', // Bleu
  Vendredi: '#6366f1', // Indigo
  Samedi:   '#0d9488', // Teal
  Dimanche: '#64748b', // Gris
};

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const todayFr = DAYS_FR[new Date().getDay()];

const formatTime = (time: string) => time.substring(0, 5);

function groupByDay(schedules: Schedule[]): Record<string, Schedule[]> {
  return schedules.reduce((acc, s) => {
    if (!acc[s.day_of_week]) acc[s.day_of_week] = [];
    acc[s.day_of_week].push(s);
    acc[s.day_of_week].sort((a, b) => a.pickup_time.localeCompare(b.pickup_time));
    return acc;
  }, {} as Record<string, Schedule[]>);
}

export default function CalendrierScreen() {
  const [schedules, setSchedules]   = useState<Schedule[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchSchedules = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/schedules`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: Schedule[] = await res.json();
      data.sort((a, b) => (DAY_ORDER[a.day_of_week] ?? 9) - (DAY_ORDER[b.day_of_week] ?? 9));
      setSchedules(data);
    } catch (e: any) {
      setError("Impossible de charger les horaires. Vérifiez votre connexion.");
      console.error("Erreur calendrier:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchSchedules(); };

  const grouped = groupByDay(schedules);
  const days = Object.keys(grouped).sort((a, b) => (DAY_ORDER[a] ?? 9) - (DAY_ORDER[b] ?? 9));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#166534']} />}
      >
        {/* ✅ Bandeau SONAGED · Dakar */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#15803d" />
          <Text style={styles.infoText}>
            Horaires SONAGED · Dakar — susceptibles de varier selon les conditions.
          </Text>
        </View>

        {/* Badge aujourd'hui */}
        <View style={styles.todayBadge}>
          <Ionicons name="today" size={16} color="#166534" />
          <Text style={styles.todayText}>
            Aujourd'hui : <Text style={{ fontWeight: '700' }}>{todayFr}</Text>
          </Text>
        </View>

        {/* Chargement */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#166534" />
            <Text style={styles.loadingText}>Chargement des horaires...</Text>
          </View>
        )}

        {/* Erreur */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline" size={28} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchSchedules}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Liste des jours */}
        {!loading && !error && days.map((day) => (
          <View key={day} style={[styles.dayGroup, day === todayFr && styles.todayGroup]}>
            <View style={[styles.dayHeader, { backgroundColor: DAY_COLORS[day] ?? '#64748b' }]}>
              <Text style={styles.dayHeaderText}>{day}</Text>
              {day === todayFr && (
                <View style={styles.todayPill}>
                  <Text style={styles.todayPillText}>En cours</Text>
                </View>
              )}
            </View>
            {grouped[day].map((s) => (
              <View key={s.id} style={styles.zoneRow}>
                <View style={styles.zoneRowLeft}>
                  <Ionicons name="location" size={16} color="#166534" style={styles.locationIcon} />
                  <Text style={styles.zoneName}>{s.zone?.name ?? `Zone ${s.zone_id}`}</Text>
                </View>
                <View style={styles.zoneRowRight}>
                  <Ionicons
                    name={parseInt(s.pickup_time) >= 18 ? 'moon' : 'sunny'}
                    size={15}
                    color={parseInt(s.pickup_time) >= 18 ? '#4f46e5' : '#d97706'} // Couleurs d'icônes légèrement plus soutenues
                  />
                  <Text style={styles.zoneTime}>{formatTime(s.pickup_time)}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Vide */}
        {!loading && !error && days.length === 0 && (
          <View style={styles.centered}>
            <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Aucun horaire disponible</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, // Arrière-plan légèrement clarifié pour faire ressortir les cartes blanches
  content:   { padding: 16 },

  infoCard: {
    flexDirection: 'row', backgroundColor: '#dcfce7', borderRadius: 14,
    padding: 14, marginBottom: 12, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  infoText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 18, fontWeight: '500' },

  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ffffff', borderRadius: 12, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  todayText: { fontSize: 13, color: '#334155' },

  dayGroup: {
    backgroundColor: 'white', borderRadius: 16, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 10 },
      android: { elevation: 2 }
    })
  },
  todayGroup: { 
    borderWidth: 2, 
    borderColor: '#166534',
    ...Platform.select({
      ios: { shadowColor: '#166534', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 }
    })
  },

  dayHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dayHeaderText: { color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  todayPill: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)'
  },
  todayPillText: { color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  zoneRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, // Légère augmentation pour faire respirer la commune
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  zoneRowLeft:  { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  zoneRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  locationIcon: { marginTop: -1 },
  zoneName:     { fontSize: 14, color: '#1e293b', fontWeight: '600' }, // Texte des quartiers mis en valeur
  zoneTime:     { fontSize: 13, color: '#0f172a', fontWeight: '700' }, // Contraste horaire renforcé pour une lecture rapide

  centered:    { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  emptyText:   { fontSize: 15, color: '#94a3b8' },

  errorCard: {
    alignItems: 'center', backgroundColor: '#fff1f2', borderRadius: 16,
    padding: 24, gap: 10, borderWidth: 1, borderColor: '#fecdd3',
  },
  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center', fontWeight: '500' },
  retryBtn:  {
    backgroundColor: '#166534', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 8, marginTop: 4,
  },
  retryText: { color: 'white', fontWeight: '700', fontSize: 13 },
});