import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, SafeAreaView, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { API_URL } from "../services/api";
import { getToken, getUser, logout } from "../services/auth";
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
 // ✅
const [user, setUser] = useState({
  name: "", email: "", phone: "", street: "", points: 0, reportsCount: 0, role: "",
});;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const getLevel = (points: number) => {
    if (points >= 500) return 'Or';
    if (points >= 100) return 'Argent';
    return 'Bronze';
  };
const menuItems = React.useMemo(() => [
  { icon: "notifications-outline", title: "Notifications", color: "#3b82f6", badge: unreadCount > 0 ? String(unreadCount) : null, route: "/notifications" },
  { icon: "shield-checkmark-outline", title: "Confidentialité", color: "#10b981", badge: null, route: "/privacy" },
  { icon: "help-circle-outline", title: "Aide et support", color: "#f59e0b", badge: null, route: "/support" },
  { icon: "information-circle-outline", title: "À propos", color: "#8b5cf6", badge: null, route: "/about" },
  { icon: "star-outline", title: "Évaluer l'application", color: "#ec4899", badge: null, route: null },
  // ✅ Bouton admin conditionnel
  ...(user.role === 'admin' ? [{ icon: "settings-outline", title: "Console Admin", color: "#166534", badge: null, route: "/admin" }] : []),
], [unreadCount, user.role]); // ✅ ajouter user.role dans les deps

useFocusEffect(
  useCallback(() => {
    fetchUser();
    fetchUnreadCount();
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
    // Dans fetchUser(), après response.ok
setUser({
  name: data.name || "", email: data.email || "",
  phone: data.telephone || data.phone || "",
  street: data.street || "", points: data.points || 0,
  reportsCount: data.reports_count || 0,
  role: data.role || "",  // ✅ ajouter cette ligne
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

  const initial = user.name?.charAt(0).toUpperCase() || "?";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Mon profil</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={24} color="#166534" />
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
              <TextInput style={styles.input} value={user.name} onChangeText={(t) => setUser({ ...user, name: t })} placeholder="Nom complet" />
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={user.email} editable={false} />
              <Text style={styles.inputLabel}>Téléphone</Text>
              <TextInput style={styles.input} value={user.phone} onChangeText={(t) => setUser({ ...user, phone: t })} keyboardType="phone-pad" />
              <Text style={styles.inputLabel}>Rue / Quartier</Text>
              <TextInput style={styles.input} value={user.street} onChangeText={(t) => setUser({ ...user, street: t })} placeholder="Ex: Médina, Plateau..." />
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user.name || "—"}</Text>
              <Text style={styles.userEmail}>{user.email || "—"}</Text>
              <Text style={styles.userPhone}>{user.phone || "Téléphone non renseigné"}</Text>
              {user.street ? (
                <View style={styles.streetBadge}>
                  <Ionicons name="location-outline" size={13} color="#166534" />
                  <Text style={styles.streetText}>{user.street}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

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
            <Text style={styles.statValue}>{getLevel(user.points)}</Text>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Paramètres</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as any) : Alert.alert("Bientôt", "Disponible prochainement")}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  profileCard: { backgroundColor: 'white', margin: 16, borderRadius: 24, padding: 24, alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 42, fontWeight: 'bold', color: 'white' },
  editAvatar: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#166534', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 8 },
  userEmail: { fontSize: 14, color: '#64748b', marginTop: 4 },
  userPhone: { fontSize: 14, color: '#64748b', marginTop: 2 },
  streetBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  streetText: { fontSize: 12, color: '#166534', fontWeight: '500' },
  editForm: { width: '100%', marginTop: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 4, marginLeft: 4 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 14, color: '#1e293b' },
  inputDisabled: { opacity: 0.5 },
  saveButton: { backgroundColor: '#166534', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 16, borderRadius: 20, padding: 16, marginBottom: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#166534' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e2e8f0' },
  menuSection: { backgroundColor: 'white', marginHorizontal: 16, borderRadius: 20, padding: 8, marginBottom: 16 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', paddingHorizontal: 12, paddingVertical: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#1e293b' },
  badge: { backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  footer: { marginHorizontal: 16, marginTop: 8, marginBottom: 20, alignItems: 'center' },
  versionText: { fontSize: 12, color: '#94a3b8', marginBottom: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, backgroundColor: 'white', borderRadius: 16, width: '100%', justifyContent: 'center' },
  logoutText: { fontSize: 16, color: '#ef4444', fontWeight: '500' },
});