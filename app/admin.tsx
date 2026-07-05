import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_URL } from '../services/api';
import { getToken, logout } from '../services/auth';

const GREEN = '#166534';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_MID = '#bbf7d0';
const SURFACE = '#ffffff';
const BG = '#F7FBF7';
const MUTED = '#94a3b8';
const TEXT = '#1e293b';
const TEXT2 = '#64748b';
const BORDER = '#e2e8f0';
const RED = '#ef4444';
const ORANGE = '#f97316';
const BLUE = '#3b82f6';

type Report = {
  id: number; location: string; description: string;
  status: string; type?: string; created_at: string;
  user?: { name: string; email: string };
};
type SupportMsg = {
  id: number; message: string; reply?: string;
  replied_at?: string; created_at: string;
  user?: { name: string; email: string };
};
type User = {
  id: number; name: string; email: string;
  role: string; street?: string; created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: ORANGE, 'en cours': BLUE, resolved: GREEN, rejected: RED,
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', 'en cours': 'En cours', resolved: 'Résolu', rejected: 'Rejeté',
};

export default function AdminScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'reports' | 'support' | 'users'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [support, setSupport] = useState<SupportMsg[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Support reply modal
  const [replyModal, setReplyModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState<SupportMsg | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const h = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      const [rRes, sRes, uRes] = await Promise.all([
        fetch(`${API_URL}/admin/reports`, { headers: h }),
        fetch(`${API_URL}/admin/support`, { headers: h }),
        fetch(`${API_URL}/admin/users`, { headers: h }),
      ]);
      const [rData, sData, uData] = await Promise.all([rRes.json(), sRes.json(), uRes.json()]);
      setReports(Array.isArray(rData) ? rData : rData?.data ?? []);
      setSupport(Array.isArray(sData) ? sData : sData?.data ?? []);
      setUsers(Array.isArray(uData) ? uData : uData?.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  // ✅ Déconnexion propre : invalide le token côté serveur, nettoie le stockage local,
  // puis redirige vers /login. Remplace l'ancien router.back() qui menait vers un écran
  // imprévisible selon l'historique de navigation (parfois /login directement, de façon incohérente).
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter", style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (token) {
              await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
              });
            }
          } catch (e) {
            console.log("Erreur serveur logout");
          } finally {
            await logout();
            router.replace('/login');
          }
        },
      },
    ]);
  };

  const changeStatus = async (id: number, status: string) => {
    const token = await getToken();
    await fetch(`${API_URL}/admin/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const sendReply = async () => {
    if (!selectedSupport || !replyText.trim()) return;
    setSending(true);
    try {
      const token = await getToken();
      await fetch(`${API_URL}/admin/support/${selectedSupport.id}/reply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText }),
      });
      setSupport(prev => prev.map(s => s.id === selectedSupport.id ? { ...s, reply: replyText } : s));
      setReplyModal(false);
      setReplyText('');
      Alert.alert('✅', 'Réponse envoyée');
    } catch (e) { Alert.alert('Erreur', 'Impossible d\'envoyer'); }
    finally { setSending(false); }
  };

  const changeRole = async (id: number, role: string) => {
    const token = await getToken();
    await fetch(`${API_URL}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  const pending = reports.filter(r => r.status === 'pending').length;
  const unreplied = support.filter(s => !s.reply).length;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={RED} />
        </TouchableOpacity>
        <Text style={s.title}>Console Admin</Text>
        <TouchableOpacity onPress={fetchAll}>
          <Ionicons name="refresh" size={22} color={GREEN} />
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statVal}>{reports.length}</Text>
          <Text style={s.statLab}>Signalements</Text>
        </View>
        <View style={[s.statBox, pending > 0 && s.statBoxAlert]}>
          <Text style={[s.statVal, pending > 0 && { color: ORANGE }]}>{pending}</Text>
          <Text style={s.statLab}>En attente</Text>
        </View>
        <View style={[s.statBox, unreplied > 0 && s.statBoxAlert]}>
          <Text style={[s.statVal, unreplied > 0 && { color: RED }]}>{unreplied}</Text>
          <Text style={s.statLab}>Sans réponse</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statVal}>{users.length}</Text>
          <Text style={s.statLab}>Utilisateurs</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {([['reports', '📋', 'Signalements'], ['support', '💬', 'Support'], ['users', '👥', 'Utilisateurs']] as const).map(([key, emoji, label]) => (
          <TouchableOpacity key={key} style={[s.tab, tab === key && s.tabActive]} onPress={() => setTab(key)}>
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{emoji} {label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={GREEN} style={{ marginTop: 40 }} size="large" />
      ) : (
        <ScrollView
          contentContainerStyle={s.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={[GREEN]} />}
        >
          {/* ── SIGNALEMENTS ── */}
          {tab === 'reports' && (reports.length === 0 ? (
            <Text style={s.empty}>Aucun signalement</Text>
          ) : reports.map(r => (
            <View key={r.id} style={s.card}>
              <View style={s.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>#{r.id} — {r.location}</Text>
                  <Text style={s.cardSub}>{r.user?.name ?? 'Anonyme'} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: STATUS_COLORS[r.status] + '22' }]}>
                  <Text style={[s.badgeText, { color: STATUS_COLORS[r.status] ?? MUTED }]}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </Text>
                </View>
              </View>
              <Text style={s.cardDesc}>{r.description}</Text>
              <View style={s.actions}>
                {['pending', 'en cours', 'resolved', 'rejected'].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[s.actionBtn, r.status === st && { backgroundColor: STATUS_COLORS[st] }]}
                    onPress={() => changeStatus(r.id, st)}
                  >
                    <Text style={[s.actionBtnText, r.status === st && { color: 'white' }]}>
                      {STATUS_LABELS[st]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )))}

          {/* ── SUPPORT ── */}
          {tab === 'support' && (support.length === 0 ? (
            <Text style={s.empty}>Aucun message support</Text>
          ) : support.map(msg => (
            <View key={msg.id} style={[s.card, !msg.reply && s.cardUnread]}>
              <View style={s.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{msg.user?.name ?? 'Anonyme'}</Text>
                  <Text style={s.cardSub}>{msg.user?.email} · {new Date(msg.created_at).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: msg.reply ? GREEN + '22' : RED + '22' }]}>
                  <Text style={[s.badgeText, { color: msg.reply ? GREEN : RED }]}>
                    {msg.reply ? '✓ Répondu' : '⏳ En attente'}
                  </Text>
                </View>
              </View>
              <Text style={s.cardDesc}>{msg.message}</Text>
              {msg.reply && (
                <View style={s.replyBox}>
                  <Text style={s.replyLabel}>Votre réponse :</Text>
                  <Text style={s.replyText}>{msg.reply}</Text>
                </View>
              )}
              <TouchableOpacity
                style={[s.replyBtn, msg.reply && s.replyBtnSecondary]}
                onPress={() => { setSelectedSupport(msg); setReplyText(msg.reply ?? ''); setReplyModal(true); }}
              >
                <Ionicons name={msg.reply ? "create-outline" : "send"} size={14} color={msg.reply ? TEXT2 : 'white'} />
                <Text style={[s.replyBtnText, msg.reply && { color: TEXT2 }]}>
                  {msg.reply ? 'Modifier' : 'Répondre'}
                </Text>
              </TouchableOpacity>
            </View>
          )))}

          {/* ── UTILISATEURS ── */}
          {tab === 'users' && (users.length === 0 ? (
            <Text style={s.empty}>Aucun utilisateur</Text>
          ) : users.map(u => (
            <View key={u.id} style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{u.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{u.name}</Text>
                  <Text style={s.cardSub}>{u.email}</Text>
                  {u.street && <Text style={s.cardSub}>📍 {u.street}</Text>}
                </View>
                <View style={[s.badge, { backgroundColor: u.role === 'admin' ? GREEN + '22' : u.role === 'driver' ? BLUE + '22' : MUTED + '33' }]}>
                  <Text style={[s.badgeText, { color: u.role === 'admin' ? GREEN : u.role === 'driver' ? BLUE : TEXT2 }]}>
                    {u.role}
                  </Text>
                </View>
              </View>
              <Text style={s.sectionLabel}>Rôle</Text>
              <View style={s.actions}>
                {['citizen', 'driver', 'admin'].map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[s.actionBtn, u.role === role && { backgroundColor: GREEN }]}
                    onPress={() => u.role !== role && Alert.alert('Changer le rôle', `Passer ${u.name} en "${role}" ?`, [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Confirmer', onPress: () => changeRole(u.id, role) },
                    ])}
                  >
                    <Text style={[s.actionBtnText, u.role === role && { color: 'white' }]}>{role}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[s.sectionLabel, { marginTop: 8 }]}>Zone</Text>
              <View style={s.actions}>
                {['Médina', 'Plateau', 'Almadies'].map(zone => (
                  <TouchableOpacity
                    key={zone}
                    style={[s.actionBtn, u.street === zone && { backgroundColor: BLUE }]}
                    onPress={async () => {
                      const token = await getToken();
                      await fetch(`${API_URL}/admin/users/${u.id}/street`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ street: zone }),
                      });
                      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, street: zone } : x));
                    }}
                  >
                    <Text style={[s.actionBtnText, u.street === zone && { color: 'white' }]}>📍 {zone}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )))}
        </ScrollView>
      )}

      {/* Reply Modal */}
      <Modal visible={replyModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Répondre à {selectedSupport?.user?.name}</Text>
            <Text style={s.modalMsg}>{selectedSupport?.message}</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Votre réponse..."
              multiline
              numberOfLines={4}
              value={replyText}
              onChangeText={setReplyText}
              placeholderTextColor={MUTED}
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setReplyModal(false)}>
                <Text style={{ color: TEXT2 }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSend} onPress={sendReply} disabled={sending}>
                {sending ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Envoyer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  title: { fontSize: 18, fontWeight: '800', color: TEXT },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  statBox: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: GREEN_LIGHT },
  statBoxAlert: { backgroundColor: '#fff7ed' },
  statVal: { fontSize: 20, fontWeight: '800', color: GREEN },
  statLab: { fontSize: 10, color: TEXT2, marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: GREEN },
  tabText: { fontSize: 12, color: MUTED, fontWeight: '600' },
  tabTextActive: { color: GREEN },
  scroll: { padding: 16, paddingBottom: 100 },
  empty: { textAlign: 'center', color: MUTED, marginTop: 40, fontSize: 15 },
  card: { backgroundColor: SURFACE, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: RED },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  cardSub: { fontSize: 12, color: MUTED, marginTop: 2 },
  cardDesc: { fontSize: 13, color: TEXT2, marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: BORDER },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: TEXT2 },
  replyBox: { backgroundColor: GREEN_LIGHT, borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: GREEN_MID },
  replyLabel: { fontSize: 11, fontWeight: '700', color: GREEN, marginBottom: 4 },
  replyText: { fontSize: 13, color: TEXT },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: GREEN, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  replyBtnSecondary: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: BORDER },
  replyBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontWeight: '800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: SURFACE, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: TEXT },
  modalMsg: { fontSize: 13, color: TEXT2, backgroundColor: '#f8fafc', borderRadius: 10, padding: 10 },
  modalInput: { borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 12, fontSize: 14, color: TEXT, minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  modalSend: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: MUTED, marginBottom: 6, marginTop: 4 },
});