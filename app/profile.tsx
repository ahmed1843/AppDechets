import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert,
  Modal,
  Platform,
  SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import { API_URL } from "../services/api";
import { getToken, getUser, logout } from "../services/auth";

// Définition de l'interface pour le typage strict du User
interface UserData {
  name: string;
  email: string;
  phone: string;
  street: string;
  points: number;
  reportsCount: number;
  role: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserData>({
    name: "", email: "", phone: "", street: "", points: 0, reportsCount: 0, role: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false); // État de chargement pour la suppression
  const [unreadCount, setUnreadCount] = useState(0);

  const [availableStreets, setAvailableStreets] = useState<string[]>([]);
  const [loadingStreets, setLoadingStreets] = useState(false);
  const realStreets = ["Plateau", "Almadies", "Médina"];

  // États pour la modale d'évaluation
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const getLevel = (points: number) => {
    if (points >= 500) return 'Or';
    if (points >= 100) return 'Argent';
    return 'Bronze';
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'Or': return { color: '#d97706', bg: '#fef3c7' };
      case 'Argent': return { color: '#475569', bg: '#f1f5f9' };
      default: return { color: '#b45309', bg: '#ffedd5' }; // Bronze
    }
  };

  const menuItems = React.useMemo(() => [
    { icon: "notifications-outline", title: "Notifications", color: "#3b82f6", badge: unreadCount > 0 ? String(unreadCount) : null, route: "/notifications" },
    { icon: "shield-checkmark-outline", title: "Confidentialité", color: "#10b981", badge: null, route: "/privacy" },
    { icon: "help-circle-outline", title: "Aide et support", color: "#f59e0b", badge: null, route: "/support" },
    { icon: "information-circle-outline", title: "À propos", color: "#8b5cf6", badge: null, route: "/about" },
    { icon: "star-outline", title: "Évaluer l'application", color: "#ec4899", badge: null, route: null },
    ...(user.role === 'admin' ? [{ icon: "settings-outline", title: "Console Admin", color: "#166534", badge: null, route: "/admin" }] : []),
  ], [unreadCount, user.role]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchUnreadCount();
      fetchStreets();
    }, [])
  );

  const fetchUser = async () => {
    try {
      const localUser = await getUser();
      if (localUser) {
        setUser(prev => ({ ...prev, name: localUser.name || "", email: localUser.email || "" }));
      }
      const token = await getToken();
      if (!token) { setLoading(false); return; }
      const response = await fetch(`${API_URL}/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setUser({
          name: data.name || "", email: data.email || "",
          phone: data.telephone || data.phone || "",
          street: data.street || "", points: data.points || 0,
          reportsCount: data.reports_count || 0,
          role: data.role || "",
        });
      } else if (response.status === 401) {
        await logout();
        router.replace('/login');
      }
    } catch (error) {
      console.log("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      });
      const data = await res.json();
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch (e) {}
  };

  const fetchStreets = async () => {
    setLoadingStreets(true);
    try {
      const response = await fetch(`${API_URL}/streets`);
      if (response.ok) {
        const data = await response.json();
        setAvailableStreets(data);
      } else {
        setAvailableStreets(realStreets);
      }
    } catch (error) {
      setAvailableStreets(realStreets);
    } finally {
      setLoadingStreets(false);
    }
  };

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

  const handleUpdateProfile = async () => {
    try {
      const token = await getToken();
      if (!token) { Alert.alert("Erreur", "Vous n'êtes pas connecté"); return; }
      const response = await fetch(`${API_URL}/user/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: JSON.stringify({ name: user.name, telephone: user.phone, street: user.street }),
      });
      if (response.ok) {
        setIsEditing(false);
        Alert.alert("✅ Succès", "Profil mis à jour !");
      } else {
        Alert.alert("Erreur", "Impossible de mettre à jour le profil");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    }
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      Alert.alert("Note requise", "Veuillez sélectionner au moins une étoile.");
      return;
    }
    setIsRatingModalVisible(false);
    Alert.alert(
      "Merci !", 
      `Votre note de ${rating}/5 a bien été prise en compte. Merci d'aider SAMA GOX à s'améliorer !`
    );
    setRating(0);
    setReviewText('');
  };

  // --- LOGIQUE DE SUPPRESSION DE COMPTE ---
  const confirmAccountDeletion = () => {
    Alert.alert(
      "⚠️ Suppression du compte",
"Êtes-vous absolument sûr de vouloir supprimer votre compte SAMA GOX ? Cette action est définitive : votre profil et vos points éco seront supprimés. Vos signalements resteront visibles de façon anonyme, pour continuer à aider votre quartier.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer définitivement", 
          style: "destructive", 
          onPress: handleDeleteAccount 
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/user/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        await logout();
        Alert.alert("Compte supprimé", "Votre compte a bien été retiré de SAMA GOX.");
        router.replace('/login');
      } else {
        Alert.alert("Erreur", data.message || "Impossible de supprimer le compte actuellement.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur réseau est survenue lors de la tentative de suppression.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  const initial = user.name?.charAt(0).toUpperCase() || "?";
  const currentLevel = getLevel(user.points);
  const levelTheme = getLevelStyle(currentLevel);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon profil</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editBtn}>
          <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={22} color="#166534" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.editAvatar}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput style={styles.input} value={user.name} onChangeText={(t) => setUser({ ...user, name: t })} placeholder="Nom complet" placeholderTextColor="#94a3b8" />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={user.email} editable={false} />
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput style={styles.input} value={user.phone} onChangeText={(t) => setUser({ ...user, phone: t })} keyboardType="phone-pad" placeholder="Numéro de téléphone" placeholderTextColor="#94a3b8" />

              <Text style={styles.inputLabel}>Rue / Quartier</Text>
              {loadingStreets ? (
                <ActivityIndicator color="#166534" style={{ marginVertical: 20 }} />
              ) : (
                <View style={styles.streetsListProfile}>
                  {availableStreets.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.streetOption, user.street === s && styles.streetOptionActive]}
                      onPress={() => setUser({ ...user, street: s })}
                    >
                      <Ionicons
                        name={user.street === s ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={user.street === s ? "#166534" : "#64748b"}
                      />
                      <Text style={[styles.streetTextOption, user.street === s && styles.streetTextActive]}>
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user.name || "—"}</Text>
              <Text style={styles.userEmail}>{user.email || "—"}</Text>
              <Text style={[styles.userPhone, !user.phone && styles.userPhoneUnset]}>
                {user.phone || "Téléphone non renseigné"}
              </Text>
              {user.street ? (
                <View style={styles.streetBadge}>
                  <Ionicons name="location" size={13} color="#166534" />
                  <Text style={styles.streetText}>{user.street}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Statistiques Gamification */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.points}</Text>
            <Text style={styles.statLabel}>Points éco</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.reportsCount}</Text>
            <Text style={styles.statLabel}>Signalements</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.levelBadge, { backgroundColor: levelTheme.bg }]}>
              <Text style={[styles.levelValue, { color: levelTheme.color }]}>{currentLevel}</Text>
            </View>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>
        </View>

        {/* Section Paramètres */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Paramètres</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => item.title === "Évaluer l'application" ? setIsRatingModalVisible(true) : item.route ? router.push(item.route as any) : null}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ZONE DE DANGER (Ajoutée proprement ici) */}
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Zone de danger</Text>
          <Text style={styles.dangerDescription}>
            La suppression est irréversible. Toutes vos données seront effacées des serveurs.
          </Text>
          <TouchableOpacity 
            style={[styles.deleteButton, deleting && styles.disabledButton]} 
            onPress={confirmAccountDeletion}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#dc2626" />
            ) : (
              <View style={styles.buttonFlexRow}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer & Déconnexion */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- MODALE D'ÉVALUATION INTERACTIVE --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isRatingModalVisible}
        onRequestClose={() => setIsRatingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsRatingModalVisible(false)}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>

            <Ionicons name="heart-circle" size={50} color="#166534" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Vous aimez SAMA GOX ?</Text>
            <Text style={styles.modalSubtitle}>Laissez-nous une note pour soutenir notre initiative citoyenne à Dakar !</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Ionicons name={star <= rating ? "star" : "star-outline"} size={32} color={star <= rating ? "#eab308" : "#cbd5e1"} />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Votre avis ou suggestion (optionnel)..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRating}>
              <Text style={styles.submitBtnText}>Envoyer mon avis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'white', 
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9' 
  },
  backBtn: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 10 },
  editBtn: { padding: 6, backgroundColor: '#f0fdf4', borderRadius: 10 },
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  
  profileCard: { 
    backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, marginBottom: 14, 
    borderRadius: 20, padding: 24, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: 'white' },
  editAvatar: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#166534', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  
  userName: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 6 },
  userEmail: { fontSize: 13, color: '#475569', marginTop: 2, fontWeight: '500' },
  userPhone: { fontSize: 13, color: '#475569', marginTop: 2, fontWeight: '500' },
  userPhoneUnset: { color: '#94a3b8', fontStyle: 'italic' },
  
  streetBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#bbf7d0' },
  streetText: { fontSize: 12, color: '#166534', fontWeight: '600' },
  
  editForm: { width: '100%', marginTop: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6, marginLeft: 2 },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 14, fontSize: 14, marginBottom: 14, color: '#0f172a', borderWidth: 1, borderColor: '#cbd5e1' },
  inputDisabled: { backgroundColor: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' },
  
  streetsListProfile: { marginBottom: 14 },
  streetOption: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 15, backgroundColor: "white", borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#cbd5e1", gap: 10 },
  streetOptionActive: { borderColor: "#166534", backgroundColor: '#f0fdf4', borderWidth: 1.5 },
  streetTextOption: { fontSize: 14, color: "#475569", fontWeight: '500' },
  streetTextActive: { color: "#166534", fontWeight: "600" },
  
  saveButton: { backgroundColor: '#166534', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 6 },
  saveButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
  
  statsContainer: { 
    flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 16, 
    borderRadius: 16, paddingVertical: 16, marginBottom: 14, alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  levelValue: { fontSize: 13, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 5, fontWeight: '600', letterSpacing: 0.1 },
  statDivider: { width: 1, height: 30, backgroundColor: '#f1f5f9' },
  
  menuSection: { 
    backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 8, marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  menuTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', paddingHorizontal: 10, paddingVertical: 10, letterSpacing: 0.2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 14, color: '#334155', fontWeight: '500' },
  badge: { backgroundColor: '#ef4444', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1.5, marginRight: 6 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  
  /* Zone de danger */
  dangerSection: {
    backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#fee2e2',
    ...Platform.select({
      ios: { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 8 },
      android: { elevation: 1 }
    })
  },
  dangerTitle: { fontSize: 14, fontWeight: '700', color: '#991b1b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  dangerDescription: { fontSize: 12, color: '#64748b', marginBottom: 14, lineHeight: 16 },
  deleteButton: {
    backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#fca5a5',
    padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center'
  },
  disabledButton: { opacity: 0.5 },
  buttonFlexRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteButtonText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },

  footer: { marginHorizontal: 16, marginTop: 10, alignItems: 'center' },
  versionText: { fontSize: 11, color: '#94a3b8', marginBottom: 12, fontWeight: '500' },
  logoutButton: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, 
    backgroundColor: 'white', borderRadius: 12, width: '100%', justifyContent: 'center',
    borderWidth: 1, borderColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4 },
      android: { elevation: 1 }
    })
  },
  logoutText: { fontSize: 15, color: '#ef4444', fontWeight: '700' },

  /* Styles de la Modale */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', position: 'relative' },
  closeModalBtn: { position: 'absolute', top: 16, right: 16, padding: 4 },
  modalIcon: { marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modalInput: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, fontSize: 13, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', textAlignVertical: 'top', height: 70, marginBottom: 18 },
  submitBtn: { backgroundColor: '#166534', width: '100%', borderRadius: 12, padding: 14, alignItems: 'center' },
  submitBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },
});