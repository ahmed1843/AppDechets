import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  SafeAreaView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, ActivityIndicator, Alert
} from "react-native";
import { API_URL } from "../services/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setStep('email');
      setEmail('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setLoading(false);
    }, [])
  );

  const handleSendCode = async () => {
    if (!email) { Alert.alert("Erreur", "Entrez votre email"); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("✅ Email envoyé", `Un code a été envoyé à ${email}`);
        setStep('code');
      } else {
        Alert.alert("Erreur", data.message);
      }
    } catch (e) {
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    console.log("🔵 handleResetPassword appelé");
    if (!code || !newPassword || !confirmPassword) {
      Alert.alert("Erreur", "Remplissez tous les champs");
      console.log("❌ Champs manquants");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      console.log("❌ Mots de passe différents");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Erreur", "Minimum 6 caractères");
      console.log("❌ Mot de passe trop court");
      return;
    }

    setLoading(true);
    try {
      console.log("📡 Envoi requête à", `${API_URL}/reset-password`);
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });
      console.log("📡 Statut HTTP:", response.status);
      const data = await response.json();
      console.log("📡 Réponse:", data);
      if (response.ok) {
        console.log("✅ Succès, passage à l'étape success");
        setStep('success');
      } else {
        Alert.alert("Erreur", data.message || "Une erreur est survenue");
      }
    } catch (e) {
      console.error("❌ Erreur fetch:", e);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#166534" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={40} color="#166534" />
        </View>

        {step === 'email' && (
          <>
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Entrez votre email et nous vous enverrons un code de réinitialisation.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Votre adresse email"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.buttonText}>Envoyer le code</Text>
              }
            </TouchableOpacity>
          </>
        )}

        {step === 'code' && (
          <>
            <Text style={styles.title}>Vérification</Text>
            <Text style={styles.subtitle}>
              Entrez le code reçu par email et votre nouveau mot de passe.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Code à 6 chiffres"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.buttonText}>Réinitialiser</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')} style={styles.resendBtn}>
              <Text style={styles.resendText}>Renvoyer le code</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'success' && (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#166534" />
            </View>
            <Text style={styles.title}>Mot de passe modifié !</Text>
            <Text style={styles.subtitle}>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FBF7' },
  backBtn: { padding: 20 },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 20 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#dcfce7',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24
  },
  successIcon: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  input: {
    width: '100%', backgroundColor: '#fff', borderRadius: 14,
    padding: 16, fontSize: 16, color: '#1e293b',
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 14
  },
  button: {
    width: '100%', backgroundColor: '#166534', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  resendBtn: { marginTop: 16 },
  resendText: { color: '#166534', fontSize: 14, fontWeight: '500' },
});