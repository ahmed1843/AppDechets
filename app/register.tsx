import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
  View,
  ActivityIndicator
} from "react-native";
import { API_URL } from "../services/api";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [street, setStreet] = useState("");
  const [streets, setStreets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);

  const realStreets = ["Plateau", "Almadies", "Médina"];

  useEffect(() => {
    fetchStreets();
  }, []);

  const fetchStreets = async () => {
    setLoadingStreets(true);
    try {
      const response = await fetch(`${API_URL}/streets`);
      if (response.ok) {
        const data = await response.json();
        setStreets(data);
      } else {
        setStreets(realStreets);
      }
    } catch (error) {
      setStreets(realStreets);
    } finally {
      setLoadingStreets(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    if (password.length < 6) {
      alert("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (role === "citizen" && !street) {
      alert("Veuillez sélectionner votre zone.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          street: role === "citizen" ? street : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Félicitations ! Votre compte EcoWaste est prêt.");
        localStorage.setItem('token', data.token);

        // ✅ Redirection selon le rôle
        if (data.user.role === 'driver') {
          router.replace('/driver');
        } else {
         router.replace('/');
        }
      } else {
        alert(data.message || "L'inscription a échoué.");
      }
    } catch (error) {
      alert("Erreur de connexion : Vérifiez que Laravel est lancé sur " + API_URL);
    } finally {
      setLoading(false);
    }
  }; // ← handleRegister se termine ici

  // ✅ Le return est EN DEHORS de handleRegister
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.iconCircle}>
              <Ionicons name="planet-outline" size={40} color={COLORS.secondary} />
            </View>
            <Text style={styles.title}>Créer un compte</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Text style={styles.label}>Je suis un :</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleOption, role === "citizen" && styles.roleActive]}
                onPress={() => setRole("citizen")}
              >
                <Text style={[styles.roleText, role === "citizen" && styles.roleTextActive]}>
                  🏠 Citoyen
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, role === "driver" && styles.roleActive]}
                onPress={() => setRole("driver")}
              >
                <Text style={[styles.roleText, role === "driver" && styles.roleTextActive]}>
                  🚛 Chauffeur
                </Text>
              </TouchableOpacity>
            </View>

            {role === "citizen" && (
              <>
                <Text style={styles.label}>📍 Dans quelle zone habitez-vous ?</Text>
                {loadingStreets ? (
                  <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
                ) : (
                  <ScrollView style={styles.streetsList} showsVerticalScrollIndicator={false}>
                    {streets.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.streetOption, street === s && styles.streetOptionActive]}
                        onPress={() => setStreet(s)}
                      >
                        <Ionicons
                          name={street === s ? "radio-button-on" : "radio-button-off"}
                          size={20}
                          color={street === s ? COLORS.primary : COLORS.muted}
                        />
                        <Text style={[styles.streetText, street === s && styles.streetTextActive]}>
                          {s}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>
                    {role === "citizen" ? "Commencer mon impact" : "Démarrer la collecte"}
                  </Text>
                  <Ionicons name="sparkles" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>

           <TouchableOpacity style={styles.loginLink} onPress={() => router.push("/login")}>
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
  input: { flex: 1, marginLeft: 10, color: COLORS.text, fontSize: 16 },
  label: { color: COLORS.primary, fontWeight: "700", marginBottom: 15, marginLeft: 5, marginTop: 10 },
  roleSelector: { flexDirection: "row", gap: 10, marginBottom: 20 },
  roleOption: {
    flex: 1, padding: 15, borderRadius: 15, backgroundColor: "white",
    alignItems: "center", borderWidth: 1, borderColor: COLORS.border
  },
  roleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleText: { color: COLORS.muted, fontWeight: "600" },
  roleTextActive: { color: "white" },
  streetsList: { maxHeight: 200, marginBottom: 20 },
  streetOption: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12,
    paddingHorizontal: 15, backgroundColor: "white", borderRadius: 12,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, gap: 10
  },
  streetOptionActive: { borderColor: COLORS.primary, backgroundColor: '#f0fdf4' },
  streetText: { fontSize: 14, color: COLORS.text, flex: 1 },
  streetTextActive: { color: COLORS.primary, fontWeight: "500" },
  registerBtn: {
    backgroundColor: COLORS.primary, height: 60, borderRadius: 18,
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 10, elevation: 5, marginTop: 10
  },
  registerBtnText: { color: "white", fontSize: 18, fontWeight: "700" },
  loginLink: { marginTop: 25, alignItems: "center" },
  loginLinkText: { color: COLORS.muted, fontSize: 15 }
});