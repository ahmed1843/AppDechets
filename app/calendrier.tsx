import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Design";

const SCHEDULE = [
  { id: '1', day: 'Lundi', time: '08:00 - 10:00', type: 'Recyclable', icon: 'sync', color: Colors.truckBlue },
  { id: '2', day: 'Mercredi', time: '07:30 - 09:30', type: 'Organique', icon: 'leaf', color: Colors.accent },
  { id: '3', day: 'Vendredi', time: '08:00 - 10:00', type: 'Déchets Ménagers', icon: 'trash', color: Colors.textSecondary },
];

export default function CalendarScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Calendrier de Collecte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Secteur A — Plateau / Nord</Text>
        
        {SCHEDULE.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View style={styles.cardContent}>
              {/* CORRECTION : On ajoute dayInfo ici */}
              <View style={styles.dayInfo}>
                <Text style={styles.dayText}>{item.day}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.typeInfo}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
                <Text style={[styles.typeText, { color: item.color }]}>{item.type}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.infoBoxText}>
            Pensez à sortir vos bacs la veille au soir ou au moins 30 minutes avant le passage.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  backBtn: { backgroundColor: Colors.surface, padding: 8, borderRadius: 12 },
  title: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  container: { padding: 20 },
  subtitle: { color: Colors.textMuted, marginBottom: 20, fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  colorBar: { width: 6 },
  cardContent: { flex: 1, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // AJOUT DES STYLES MANQUANTS
  dayInfo: {
    flex: 1,
  },
  dayText: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  timeText: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  typeInfo: { alignItems: 'flex-end', gap: 4 },
  typeText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  infoBox: { flexDirection: 'row', gap: 10, padding: 15, backgroundColor: Colors.surface, borderRadius: 12, marginTop: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border },
  infoBoxText: { flex: 1, color: Colors.textMuted, fontSize: 13, lineHeight: 18 },
});
