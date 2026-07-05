import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import React, { useState } from 'react';

import { API_URL } from '../services/api';
import { getToken, logout } from '../services/auth';

// ✅ Ajoute la ligne react-native manquante
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsScreen() {
  const router = useRouter();
const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
  useCallback(() => {
    fetchNotifications();
  }, [])
);

const fetchNotifications = async () => {
  try {
    const token = await getToken();
console.log('🔑 Token utilisé par l\'app:', token);
    const res = await fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });

    if (res.status === 401) {
      await logout();
      router.replace('/login');
      return;
    }

    const data = await res.json();
    setNotifications(Array.isArray(data) ? data : data?.data ?? []);
  } catch (e) {
    console.error('FETCH ERROR:', e);
    setNotifications([]); // ← évite le crash
  } finally {
    setLoading(false);
  }
};
  const markAsRead = async (id: number) => {
    const token = await getToken();
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
    });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#166534" size="large" />
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={60} color="#cbd5e1" />
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {notifications.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[styles.card, !n.is_read && styles.cardUnread]}
              onPress={() => !n.is_read && markAsRead(n.id)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name={n.is_read ? "notifications-outline" : "notifications"}
                  size={22}
                  color={n.is_read ? "#94a3b8" : "#166534"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, !n.is_read && styles.cardTitleUnread]}>
                  {n.title}
                </Text>
                <Text style={styles.cardMessage}>{n.message}</Text>
                <Text style={styles.cardDate}>
                  {new Date(n.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              </View>
              {!n.is_read && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  unreadBanner: {
    backgroundColor: '#f0fdf4', padding: 10, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#bbf7d0',
  },
  unreadText: { color: '#166534', fontWeight: '600', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#94a3b8', fontSize: 16 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: '#166534' },
  cardIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center',
  },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  cardTitleUnread: { fontWeight: '700', color: '#1e293b' },
  cardMessage: { fontSize: 13, color: '#64748b', marginTop: 2 },
  cardDate: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#166534', marginTop: 4,
  },
});