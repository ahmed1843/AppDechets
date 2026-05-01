import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { ActionButton } from "../components/ui/ActionButton";
import { Colors } from "../constants/Design";

export default function ProfileScreen() {
  const router = useRouter();
  
  // États pour les données modifiables
  const [name, setName] = useState("Moussa Diop");
  const [email, setEmail] = useState("moussa.diop@ecowaste.com");
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 1. Header Profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{name}</Text>
          <View style={styles.scoreBadge}>
            <Ionicons name="leaf" size={14} color={Colors.accent} />
            <Text style={styles.scoreText}>1,250 points Eco</Text>
          </View>
        </View>

        {/* 2. Informations Personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} />
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName} 
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} />
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* 3. Paramètres & Préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.settingLabel}>Notifications push</Text>
            </View>
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.accentDim }}
              thumbColor={isNotificationsEnabled ? Colors.accent : Colors.textMuted}
            />
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.settingLabel}>Changer le mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 4. Actions de compte */}
        <View style={styles.actionSection}>
          <ActionButton 
            label="Enregistrer les modifications" 
            onPress={() => alert("Profil mis à jour !")} 
            variant="primary"
          />
          <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingBottom: 60 },
  profileHeader: { alignItems: "center", marginBottom: 40 },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarText: { color: Colors.accent, fontSize: 40, fontWeight: "900" },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: { color: Colors.textPrimary, fontSize: 24, fontWeight: "800", marginBottom: 8 },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  scoreText: { color: Colors.accent, fontSize: 13, fontWeight: "700" },
  section: { marginBottom: 30 },
  sectionTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { color: Colors.textSecondary, fontSize: 14, marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 56,
  },
  input: { flex: 1, color: Colors.textPrimary, marginLeft: 12, fontSize: 16 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: "600" },
  actionSection: { marginTop: 10, gap: 20 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 10 },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: "700" },
});
