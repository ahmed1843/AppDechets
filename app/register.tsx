import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, ScrollView, Platform, Alert
} from "react-native";
import { API_URL } from "../services/api";

export default function RegisterScreen() {
  const router = useRouter();
  
  // États du formulaire
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"citizen" | "driver">("citizen");
  const [street, setStreet] = useState("");
  
  // États UX
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableStreets = ["Plateau", "Almadies", "Médina"];

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (role === "citizen" && !street) {
      setError("Veuillez sélectionner votre zone de résidence");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
        Alert.alert("✅ Succès", "Votre compte a été créé avec succès ! Connectez-vous.", [
          { text: "OK", onPress: () => router.replace("/login") }
        ]);
      } else {
        setError(data.message || "Une erreur est survenue lors de l'inscription");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Bouton Retour en haut à gauche */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#14532d" />
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Logo SAMA GOX */}
            <View style={styles.logoZone}>
              <View style={styles.logoCircle}>
                <Ionicons name="trash" size={26} color="#4ade80" />
              </View>
              <View style={styles.logoRow}>
                <Text style={styles.logoSama}>SAMA</Text>
                <Text style={styles.logoGox}> GOX</Text>
              </View>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>Mon quartier propre</Text>
              </View>
            </View>

            <Text style={styles.title}>Créer un compte</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Champ Nom Complet */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Champ Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Champ Mot de passe */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#94a3b8"
                secureTextEntry={secureText}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Sélection du Rôle */}
            <Text style={styles.sectionLabel}>Je suis un :</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={[styles.roleButton, role === "citizen" && styles.roleButtonActiveCitizen]} 
                onPress={() => setRole("citizen")}
              >
                <Text style={[styles.roleButtonText, role === "citizen" && styles.roleButtonTextActive]}>🏠 Citoyen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roleButton, role === "driver" && styles.roleButtonActiveDriver]} 
                onPress={() => {
                  setRole("driver");
                  setStreet(""); // Reset de la rue si chauffeur
                }}
              >
                <Text style={[styles.roleButtonText, role === "driver" && styles.roleButtonTextActive]}>🚛 Chauffeur</Text>
              </TouchableOpacity>
            </View>

            {/* Sélection de la Zone (uniquement pour les Citoyens) */}
            {role === "citizen" && (
              <View style={styles.zoneSection}>
                <Text style={styles.sectionLabel}>📍 Dans quelle zone habitez-vous ?</Text>
                {availableStreets.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.radioOption, street === item && styles.radioOptionActive]}
                    onPress={() => setStreet(item)}
                  >
                    <Ionicons 
                      name={street === item ? "radio-button-on" : "radio-button-off"} 
                      size={18} 
                      color={street === item ? "#166534" : "#cbd5e1"} 
                    />
                    <Text style={[styles.radioText, street === item && styles.radioTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Bouton d'inscription */}
        <TouchableOpacity
  style={[styles.button, loading && styles.buttonDisabled]}
  onPress={handleRegister}
  disabled={loading}
  activeOpacity={0.85}
>
  {loading ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={styles.buttonText}>
      {role === "citizen" ? "Commencer mon impact ✨" : "Démarrer mes tournées 🚛"}
    </Text>
  )}
</TouchableOpacity>

            {/* Lien de redirection vers Connexion (sans le mot de passe oublié) */}
            <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>
                Déjà membre ? <Text style={styles.loginLinkBold}>Se connecter</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginTop: 20
  },
  logoZone:      { alignItems: 'center', marginBottom: 16, gap: 4 },
  logoCircle:    { width: 50, height: 50, borderRadius: 25, backgroundColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  logoRow:       { flexDirection: 'row', alignItems: 'baseline' },
  logoSama:      { fontSize: 16, fontWeight: '800', color: '#14532d', letterSpacing: 0.5 },
  logoGox:       { fontSize: 16, fontWeight: '300', color: '#16a34a', letterSpacing: 2 },
  logoBadge:     { backgroundColor: '#14532d', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  logoBadgeText: { fontSize: 9, color: '#4ade80' },
  
  title: { fontSize: 20, fontWeight: 'bold', color: '#14532d', textAlign: 'center', marginBottom: 20 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '500' },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  eyeIcon: { padding: 4 },
  
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#166534', marginTop: 8, marginBottom: 10 },
  
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  roleButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleButtonActiveCitizen: { backgroundColor: '#166534', borderColor: '#166534' },
  roleButtonActiveDriver: { backgroundColor: '#b91c1c', borderColor: '#b91c1c' }, // Rouge brique pour distinguer visuellement le chauffeur
  roleButtonText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  roleButtonTextActive: { color: 'white' },
  
  zoneSection: { marginBottom: 14 },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 10
  },
  radioOptionActive: { borderColor: '#166534', backgroundColor: '#f0fdf4' },
  radioText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  radioTextActive: { color: '#166534', fontWeight: '600' },
  
  button: { backgroundColor: '#166534', padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 10, marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  
  loginLink: { alignItems: 'center', paddingVertical: 4 },
  loginLinkText: { color: '#64748b', fontSize: 13 },
  loginLinkBold: { color: '#166534', fontWeight: 'bold' },
});