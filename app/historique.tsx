import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView, StyleSheet, Text, TouchableOpacity,
  View, FlatList, Platform, RefreshControl, Image, ActivityIndicator
} from "react-native";
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ remplace localStorage
// ✅ APRÈS
import api, { API_URL } from "../services/api";

interface Report {
  id: number;
  title: string;
  status: string;
  created_at: string;
  description: string;
  location: string;
  photo_path: string | null;
}

export default function HomeHistoryScreen() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyReports = async () => {
    try {
      // ✅ APRÈS
      const token = await AsyncStorage.getItem('token');
     const response = await fetch(`${API_URL}/my-reports`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  }
});

if (response.status === 401) {
  await AsyncStorage.multiRemove(['token', 'user', 'role']);
  router.replace('/login');
  return;
}

const json = await response.json();
console.log("📋 Historique:", json);
setReports(json.data || []);
    } catch (error) {
      console.error("Erreur historique:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyReports();
  }, []);

  const renderStatusBadge = (status: string) => {
  const config: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:    { label: 'En attente', color: '#ea580c', bg: '#fff7ed', icon: 'time-outline' },
  'en cours': { label: 'En cours',   color: '#2563eb', bg: '#eff6ff', icon: 'construct-outline' },
  resolved:   { label: 'Résolu',     color: '#16a34a', bg: '#f0fdf4', icon: 'checkmark-circle-outline' },
  rejected:   { label: 'Rejeté',     color: '#dc2626', bg: '#fef2f2', icon: 'close-circle-outline' },
};
    const current = config[status] || config.pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: current.bg }]}>
        <Ionicons name={current.icon as any} size={14} color={current.color} />
        <Text style={[styles.statusText, { color: current.color }]}>{current.label}</Text>
      </View>
    );
  };

  const getImageUrl = (photoPath: string) => {
    const base = API_URL.replace('/api', '');
    return `${base}/storage/${photoPath}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Historique</Text>
        <TouchableOpacity onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/report");
        }}>
          <Ionicons name="add-circle" size={40} color="#166534" />
        </TouchableOpacity>
      </View>

 {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#166534" size="large" />
      ) : (
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
              {renderStatusBadge(item.status)}
            </View>

            {item.photo_path && (
              <Image
                source={{ uri: getImageUrl(item.photo_path) }}
                style={styles.reportImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.description} numberOfLines={2}>
              {item.description || "Aucune description."}
            </Text>

            <View style={styles.cardFooter}>
              <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>Aucun signalement trouvé.</Text>
            <Text style={styles.emptySubText}>Appuyez sur + pour signaler un dépôt</Text>
          </View>
        }
      />
  )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: '#fff', elevation: 2
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  list: { padding: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15,
    borderWidth: 1, borderColor: '#e2e8f0',
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.05)' } as any,
      default: { elevation: 2 }
    })
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10
  },
  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', flex: 1, marginRight: 8 },
  reportImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 10 },
  description: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5
  },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10
  },
  date: { fontSize: 11, color: '#94a3b8' },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  emptySubText: { fontSize: 13, color: '#94a3b8' },
});