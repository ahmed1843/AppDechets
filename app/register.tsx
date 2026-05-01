import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const COLORS = {
  primary: "#166534",
  secondary: "#22c55e",
  bg: "#F7FBF7",
  inputBg: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1e293b",
  muted: "#64748b"
};

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState("resident");

  const handleRegister = () => {
    if (role === "driver") {
      Alert.alert("Mode Chauffeur", "Compte créé !");
    } else {
      Alert.alert("Mode Citoyen", "Bienvenue !");
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <View style={styles.iconCircle}>
              <Ionicons name="planet-outline" size={40} color={COLORS.secondary} />
            </View>

            <Text style={styles.title}>Créer un compte</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#94a3b8"
                secureTextEntry
              />
            </View>

            {/* Role */}
            <Text style={styles.label}>Je suis un :</Text>

            <View style={styles.roleSelector}>
              <TouchableOpacity 
                style={[styles.roleOption, role === "resident" && styles.roleActive]} 
                onPress={() => setRole("resident")}
              >
                <Text style={[styles.roleText, role === "resident" && styles.roleTextActive]}>
                  Citoyen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleOption, role === "driver" && styles.roleActive]} 
                onPress={() => setRole("driver")}
              >
                <Text style={[styles.roleText, role === "driver" && styles.roleTextActive]}>
                  Chauffeur
                </Text>
              </TouchableOpacity>
            </View>

                       {/* Button */}
            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
              <Text style={styles.registerBtnText}>Commencer mon impact</Text>
              <Ionicons name="sparkles" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/")}>
              <Text style={styles.loginLinkText}>
                Déjà membre ? <Text style={{fontWeight: 'bold', color: COLORS.primary}}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: "center", padding: 30, paddingTop: 50 },
  backBtn: { position: 'absolute', left: 20, top: 50, zIndex: 10 },
  iconCircle: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: "white", 
    justifyContent: "center", alignItems: "center", elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10
  },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.primary, marginTop: 20 },
  form: { padding: 30 },
  inputWrapper: { 
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBg, 
    borderRadius: 18, paddingHorizontal: 15, height: 60, marginBottom: 15, 
    borderWidth: 1, borderColor: COLORS.border, elevation: 1 
  },
  input: { flex: 1, marginLeft: 10, color: COLORS.text },
  label: { color: COLORS.primary, fontWeight: "700", marginBottom: 15, marginLeft: 5 },
  roleSelector: { flexDirection: "row", gap: 10, marginBottom: 30 },
  roleOption: { 
    flex: 1, padding: 15, borderRadius: 15, backgroundColor: "white", 
    alignItems: "center", borderWidth: 1, borderColor: COLORS.border 
  },
  roleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.muted, fontWeight: "600" },
  roleTextActive: { color: "white" },
  registerBtn: { 
    backgroundColor: COLORS.primary, height: 60, borderRadius: 18, 
    flexDirection: "row", justifyContent: "center", alignItems: "center", 
    gap: 10, elevation: 5 
  },
  registerBtnText: { color: "white", fontSize: 18, fontWeight: "700" },
  loginLink: { marginTop: 25, alignItems: "center" },
  loginLinkText: { color: COLORS.muted }
});
