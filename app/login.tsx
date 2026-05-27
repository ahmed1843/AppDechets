import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  ImageBackground, StatusBar, KeyboardAvoidingView, Platform,
} from "react-native";
import { saveAuth } from "../services/auth";
import { API_URL } from "../services/api";

// 🗑️ Image de fond locale — camion de collecte des déchets
const BG_IMAGE = require('../assets/images/bg-login.jpg');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Logique inchangée ───────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('=== REPONSE REGISTER ===', JSON.stringify(data));

      if (response.ok) {
        console.log('=== ROLE RECU ===', data.user.role);
        console.log('=== DATA USER ===', JSON.stringify(data.user));
        await saveAuth(data.token, {
          id:    data.user.id,
          name:  data.user.name,
          email: data.user.email,
          role:  data.user.role,
        });
        if (data.user.role === 'driver') {
          router.replace('/driver');
        } else {
          router.replace('/');
        }
      } else {
        setError(data.message || "Identifiants incorrects");
      }
    } catch (error) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  return (
    <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
      <StatusBar barStyle="light-content" />

      {/* Overlay sombre en dégradé */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          {/* Logo / Icône en haut */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>♻️</Text>
            </View>
            <Text style={styles.appName}>SmartWaste</Text>
            <Text style={styles.appTagline}>Gestion intelligente des déchets</Text>
          </View>

          {/* Carte de connexion */}
          <View style={styles.card}>
            <Text style={styles.title}>Bon retour 👋</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Champ Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Champ Mot de passe */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.buttonText}>Se connecter</Text>
              }
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              style={styles.registerButton}
            >
              <Text style={styles.registerText}>
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // ── Fond & overlay ──────────────────────────────────────────────────────
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 25, 10, 0.35)', // overlay léger pour voir l'image
  },
  safe: {
    flex: 1,
  },
  kav: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // ── Logo ────────────────────────────────────────────────────────────────
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 34 },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // ── Carte ───────────────────────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)', // glassmorphism : semi-transparent
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 22,
  },

  // ── Erreur ──────────────────────────────────────────────────────────────
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorIcon: { fontSize: 14 },
  errorText:  { color: '#dc2626', fontSize: 13, fontWeight: '500', flex: 1 },

  // ── Inputs ──────────────────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1e293b',
  },

  // ── Mot de passe oublié ─────────────────────────────────────────────────
  forgotLink:  { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText:  { color: '#86efac', fontSize: 13, fontWeight: '600' },

  // ── Bouton principal ─────────────────────────────────────────────────────
  button: {
    backgroundColor: '#166534',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // ── Séparateur ──────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  registerButton: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  registerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
});