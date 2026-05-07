import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";

export default function PointsScreen() {
  const router = useRouter();
  const [userPoints, setUserPoints] = useState(1250);
  const [level, setLevel] = useState("Bronze");
  const [nextLevelPoints, setNextLevelPoints] = useState(2000);

  const actions = [
    { name: "Signaler un dépôt", points: 50, icon: "warning", color: "#ef4444", done: true },
    { name: "Ajouter une photo", points: 20, icon: "camera", color: "#10b981", done: true },
    { name: "Partager l'application", points: 30, icon: "share-social", color: "#3b82f6", done: false },
    { name: "Inviter un ami", points: 100, icon: "person-add", color: "#8b5cf6", done: false },
    { name: "Signaler 5 dépôts", points: 200, icon: "trophy", color: "#f59e0b", done: false },
  ];

  const getLevelColor = () => {
    switch(level) {
      case 'Bronze': return '#cd7f32';
      case 'Argent': return '#c0c0c0';
      case 'Or': return '#ffd700';
      default: return '#cd7f32';
    }
  };

  const getNextLevel = () => {
    if (level === 'Bronze') return 'Argent';
    if (level === 'Argent') return 'Or';
    return 'Platine';
  };

  const progress = (userPoints / nextLevelPoints) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes points</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Carte des points */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Ionicons name="star" size={32} color="#f59e0b" />
            <Text style={styles.pointsTitle}>Votre solde</Text>
          </View>
          <Text style={styles.pointsValue}>{userPoints}</Text>
          <Text style={styles.pointsSubtext}>points éco-citoyens</Text>
          
          <View style={styles.levelContainer}>
            <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor()}20` }]}>
              <Text style={[styles.levelText, { color: getLevelColor() }]}>{level}</Text>
            </View>
            <Text style={styles.nextLevelText}>
              Plus que {nextLevelPoints - userPoints} points pour passer {getNextLevel()}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: getLevelColor() }]} />
          </View>
        </View>

        {/* Comment gagner des points */}
        <Text style={styles.sectionTitle}>🏆 Gagnez des points</Text>
        
        {actions.map((action, index) => (
          <View key={index} style={[styles.actionCard, action.done && styles.actionCardDone]}>
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionName, action.done && styles.actionNameDone]}>{action.name}</Text>
              <Text style={styles.actionPoints}>+{action.points} points</Text>
            </View>
            {action.done ? (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
            ) : (
              <TouchableOpacity style={styles.doButton}>
                <Text style={styles.doButtonText}>Faire</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Historique */}
        <Text style={styles.sectionTitle}>📜 Historique</Text>
        
        <View style={styles.historyCard}>
          <View style={styles.historyItem}>
            <View>
              <Text style={styles.historyTitle}>Signalement de dépôt</Text>
              <Text style={styles.historyDate}>Aujourd'hui - 14:30</Text>
            </View>
            <Text style={styles.historyPoints}>+50</Text>
          </View>
          <View style={styles.historyDivider} />
          <View style={styles.historyItem}>
            <View>
              <Text style={styles.historyTitle}>Photo ajoutée</Text>
              <Text style={styles.historyDate}>Hier - 10:15</Text>
            </View>
            <Text style={styles.historyPoints}>+20</Text>
          </View>
          <View style={styles.historyDivider} />
          <View style={styles.historyItem}>
            <View>
              <Text style={styles.historyTitle}>Premier signalement</Text>
              <Text style={styles.historyDate}>12/05/2026</Text>
            </View>
            <Text style={styles.historyPoints}>+10</Text>
          </View>
        </View>

        {/* Classement */}
        <TouchableOpacity style={styles.rankingButton}>
          <Ionicons name="trophy" size={20} color="#f59e0b" />
          <Text style={styles.rankingButtonText}>Voir le classement des citoyens</Text>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  pointsCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 24 },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  pointsTitle: { fontSize: 16, color: '#64748b' },
  pointsValue: { fontSize: 48, fontWeight: 'bold', color: '#166534' },
  pointsSubtext: { fontSize: 14, color: '#64748b', marginTop: 4 },
  levelContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  levelText: { fontSize: 14, fontWeight: '600' },
  nextLevelText: { fontSize: 13, color: '#64748b' },
  progressContainer: { width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginTop: 8 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 10 },
  actionCardDone: { opacity: 0.6 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionInfo: { flex: 1 },
  actionName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  actionNameDone: { textDecorationLine: 'line-through' },
  actionPoints: { fontSize: 12, color: '#10b981', marginTop: 2 },
  checkIcon: { width: 40, alignItems: 'center' },
  doButton: { backgroundColor: '#166534', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  doButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  historyCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  historyDivider: { height: 1, backgroundColor: '#e2e8f0' },
  historyTitle: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
  historyDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  historyPoints: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
  rankingButton: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', gap: 12, justifyContent: 'center' },
  rankingButtonText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#166534', textAlign: 'center' },
});