import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";

export default function CalendrierScreen() {
  const router = useRouter();

  const schedules = [
    { day: "Lundi", zones: ["Médina", "Plateau"], time: "08:00 - 12:00" },
    { day: "Mardi", zones: ["Fann", "Ouakam"], time: "08:00 - 12:00" },
    { day: "Mercredi", zones: ["Grand Yoff", "HLM"], time: "08:00 - 12:00" },
    { day: "Jeudi", zones: ["Mermoz", "Sacre Coeur"], time: "08:00 - 12:00" },
    { day: "Vendredi", zones: ["Médina", "Plateau", "Fann"], time: "08:00 - 12:00" },
    { day: "Samedi", zones: ["Ouakam", "Grand Yoff"], time: "09:00 - 13:00" },
  ];

  const getDayColor = (day: string) => {
    const colors: any = {
      'Lundi': '#ef4444', 'Mardi': '#f59e0b', 'Mercredi': '#10b981',
      'Jeudi': '#3b82f6', 'Vendredi': '#8b5cf6', 'Samedi': '#ec4897'
    };
    return colors[day] || '#64748b';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Horaires de passage</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#166534" />
          <Text style={styles.infoText}>Les horaires sont susceptibles de changer selon les conditions</Text>
        </View>

        {schedules.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.dayBadge, { backgroundColor: getDayColor(item.day) }]}>
              <Text style={styles.dayText}>{item.day}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.zonesText}>📍 {item.zones.join(' • ')}</Text>
              <Text style={styles.timeText}>🕐 {item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  infoCard: { flexDirection: 'row', backgroundColor: '#dcfce7', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center', gap: 10 },
  infoText: { flex: 1, fontSize: 13, color: '#166534' },
  card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  dayBadge: { width: 80, justifyContent: 'center', alignItems: 'center', paddingVertical: 15 },
  dayText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cardContent: { flex: 1, padding: 15 },
  zonesText: { fontSize: 14, color: '#1e293b', marginBottom: 4 },
  timeText: { fontSize: 13, color: '#64748b' },
});