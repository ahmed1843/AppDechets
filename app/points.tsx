import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from "react-native";
import { API_URL } from '../services/api';
import { getToken } from '../services/auth';

// ── Logique de niveau ─────────────────────────────────────────────────────────
const getLevel = (pts: number) => {
  if (pts >= 500) return { name: 'Or',     color: '#ffd700', next: null,     threshold: 500 };
  if (pts >= 100) return { name: 'Argent', color: '#c0c0c0', next: 'Or',     threshold: 500 };
  return               { name: 'Bronze',  color: '#cd7f32', next: 'Argent', threshold: 100 };
};

const ACTIONS = [
  { name: "Signaler un dépôt",   points: 50,  icon: "warning",     color: "#ef4444", route: '/report'    },
  { name: "Ajouter une photo",   points: 20,  icon: "camera",      color: "#10b981", route: '/report'    },
  { name: "Inviter un ami",      points: 100, icon: "person-add",  color: "#8b5cf6", route: null         },
  { name: "Signaler 5 dépôts",   points: 200, icon: "trophy",      color: "#f59e0b", route: null         },
  { name: "Partager l'app",      points: 30,  icon: "share-social",color: "#3b82f6", route: null         },
];

export default function PointsScreen() {
  const router = useRouter();
  const [userPoints, setUserPoints]   = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  const [history, setHistory]         = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  const levelInfo       = getLevel(userPoints);
  const nextThreshold   = levelInfo.threshold;
  const progress        = Math.min((userPoints / nextThreshold) * 100, 100);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const token = await getToken();
          const res = await fetch(`${API_URL}/user`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            setUserPoints(data.points || 0);
            setReportsCount(data.reports_count || 0);
          }

          // Historique des signalements pour l'historique points
          const resReports = await fetch(`${API_URL}/my-reports`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          });
          if (resReports.ok) {
            const dataReports = await resReports.json();
            setHistory((dataReports.data || []).slice(0, 5));
          }
        } catch (e) {
          console.log('Erreur points:', e);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return `Aujourd'hui - ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diff === 1) return `Hier - ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes points éco</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── Carte points ──────────────────────────────────── */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Ionicons name="star" size={32} color="#f59e0b" />
            <Text style={styles.pointsTitle}>Votre solde</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#166534" size="large" style={{ marginVertical: 16 }} />
          ) : (
            <Text style={styles.pointsValue}>{userPoints}</Text>
          )}

          <Text style={styles.pointsSubtext}>points éco-citoyens</Text>

          <View style={styles.levelContainer}>
            <View style={[styles.levelBadge, { backgroundColor: `${levelInfo.color}25` }]}>
              <Text style={[styles.levelText, { color: levelInfo.color }]}>
                {levelInfo.name}
              </Text>
            </View>
            <Text style={styles.nextLevelText}>
              {levelInfo.next
                ? `Plus que ${nextThreshold - userPoints} pts pour ${levelInfo.next}`
                : '🏆 Niveau maximum atteint !'}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, {
              width: `${progress}%`,
              backgroundColor: levelInfo.color,
            }]} />
          </View>

          {/* Stats rapides */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{reportsCount}</Text>
              <Text style={styles.quickStatLabel}>Signalements</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{userPoints}</Text>
              <Text style={styles.quickStatLabel}>Points gagnés</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{levelInfo.name}</Text>
              <Text style={styles.quickStatLabel}>Niveau actuel</Text>
            </View>
          </View>
        </View>

        {/* ── Niveaux ───────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>🎖️ Niveaux</Text>
        <View style={styles.levelsCard}>
          {[
            { name: 'Bronze', min: 0,   max: 99,  color: '#cd7f32' },
            { name: 'Argent', min: 100, max: 499, color: '#c0c0c0' },
            { name: 'Or',     min: 500, max: null, color: '#ffd700' },
          ].map((l) => {
            const isCurrent = levelInfo.name === l.name;
            return (
              <View key={l.name} style={[styles.levelRow, isCurrent && styles.levelRowActive]}>
                <View style={[styles.levelDot, { backgroundColor: l.color }]} />
                <Text style={[styles.levelRowName, isCurrent && { color: l.color, fontWeight: '700' }]}>
                  {l.name} {isCurrent ? '← vous êtes ici' : ''}
                </Text>
                <Text style={styles.levelRowRange}>
                  {l.max ? `${l.min} – ${l.max} pts` : `${l.min}+ pts`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Comment gagner des points ──────────────────────── */}
        <Text style={styles.sectionTitle}>🏆 Gagnez des points</Text>
        {ACTIONS.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={() => action.route ? router.push(action.route as any) : null}
            activeOpacity={action.route ? 0.7 : 1}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionName}>{action.name}</Text>
              <Text style={styles.actionPoints}>+{action.points} points</Text>
            </View>
            {action.route ? (
              <TouchableOpacity
                style={styles.doButton}
                onPress={() => router.push(action.route as any)}
              >
                <Text style={styles.doButtonText}>Faire</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>Bientôt</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* ── Historique réel ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>📜 Historique récent</Text>
        <View style={styles.historyCard}>
          {loading ? (
            <ActivityIndicator color="#166534" style={{ padding: 20 }} />
          ) : history.length === 0 ? (
            <Text style={styles.emptyText}>Aucun signalement pour l'instant</Text>
          ) : (
            history.map((item, i) => (
              <View key={item.id}>
                <View style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={[styles.historyDot, {
                      backgroundColor: item.status === 'resolved' ? '#10b981'
                        : item.status === 'in_progress' ? '#f59e0b' : '#94a3b8'
                    }]} />
                    <View>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyPoints}>+50</Text>
                </View>
                {i < history.length - 1 && <View style={styles.historyDivider} />}
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F7FBF7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, backgroundColor: 'white',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  title:        { fontSize: 18, fontWeight: 'bold' },
  content:      { padding: 16, paddingBottom: 100 },

  // Points card
  pointsCard:   { backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20 },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  pointsTitle:  { fontSize: 16, color: '#64748b' },
  pointsValue:  { fontSize: 52, fontWeight: 'bold', color: '#166534' },
  pointsSubtext:{ fontSize: 14, color: '#64748b', marginTop: 4 },
  levelContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  levelBadge:   { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  levelText:    { fontSize: 14, fontWeight: '700' },
  nextLevelText:{ fontSize: 12, color: '#64748b', textAlign: 'center' },
  progressContainer: { width: '100%', height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  progressBar:  { height: '100%', borderRadius: 4 },
  quickStats:   { flexDirection: 'row', width: '100%', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  quickStat:    { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 18, fontWeight: 'bold', color: '#166534' },
  quickStatLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  quickStatDivider: { width: 1, backgroundColor: '#e2e8f0' },

  // Niveaux
  levelsCard:   { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20 },
  levelRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderRadius: 10, paddingHorizontal: 4 },
  levelRowActive: { backgroundColor: '#f0fdf4' },
  levelDot:     { width: 12, height: 12, borderRadius: 6 },
  levelRowName: { flex: 1, fontSize: 14, color: '#1e293b' },
  levelRowRange:{ fontSize: 12, color: '#94a3b8' },

  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginTop: 4 },

  // Actions
  actionCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 10 },
  actionIcon:   { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionInfo:   { flex: 1 },
  actionName:   { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  actionPoints: { fontSize: 12, color: '#10b981', marginTop: 2 },
  doButton:     { backgroundColor: '#166534', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  doButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  soonBadge:    { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  soonText:     { color: '#94a3b8', fontSize: 11, fontWeight: '500' },

  // Historique
  historyCard:  { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20 },
  historyItem:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  historyLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  historyDot:   { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  historyTitle: { fontSize: 14, fontWeight: '500', color: '#1e293b', flex: 1 },
  historyDate:  { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  historyPoints:{ fontSize: 16, fontWeight: 'bold', color: '#10b981' },
  historyDivider: { height: 1, backgroundColor: '#f1f5f9' },
  emptyText:    { fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: 20 },
});