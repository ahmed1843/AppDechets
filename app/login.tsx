import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from "react-native";
import { saveAuth } from "../services/auth";
// ✅ Après
import { API_URL } from "../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
}else {
        setError(data.message || "Identifiants incorrects");
      }
    } catch (error) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>Bon retour 👋</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="votre@email.com"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

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

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Pas de compte ?{' '}
            <Text style={styles.registerTextBold}>S'inscrire</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F0FDF4',
    justifyContent: 'center', padding: 20,
  },
  card: {
    backgroundColor: 'white', borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  title:    { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  errorBox: {
    backgroundColor: '#fee2e2', borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '500' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12,
    marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0',
    fontSize: 15, color: '#1e293b',
  },
  forgotLink:  { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText:  { color: '#166534', fontSize: 13, fontWeight: '500' },
  button: {
    backgroundColor: '#166534', padding: 16, borderRadius: 14,
    alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: 'white', fontWeight: 'bold', fontSize: 16 },
  registerLink:   { alignItems: 'center', paddingTop: 4 },
  registerText:   { color: '#64748b', fontSize: 14 },
  registerTextBold: { color: '#166534', fontWeight: 'bold' },
});