import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; // Ajoute Alert ici
import api from '../services/api'; // Ajoute ton service api ici

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  try {
    // 1. Appel à l'API Laravel (on va créer cette route juste après)
    const response = await api.post('/login', {
      email: email,
      password: password,
    });

    // 2. Si ça marche, on récupère les infos
    const { token, user } = response.data;
    
    console.log("Connecté !", user);
    
    // 3. Direction le sélecteur de rôles
    router.replace("/roles");

  } catch (error: any) {
    // Affiche une erreur si l'email ou le mot de passe est faux
    Alert.alert("Erreur", "Identifiants incorrects ou serveur injoignable");
    console.error(error);
  }
};
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leafCircle}>
            <Ionicons name="leaf" size={50} color="#22c55e" />
          </View>

          <Text style={styles.brandName}>EcoWaste</Text>
          <Text style={styles.slogan}>
            Réduisons le bruit, préservons l'environnement.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Connexion</Text>
          <Text style={styles.subText}>
            Agissez pour une ville plus propre et plus calme dès maintenant.
          </Text>

          <View style={styles.inputGroup}>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Adresse email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Rejoindre</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.signUpText}> S'inscrire</Text>
            </TouchableOpacity>
          </View>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FBF7" },
  flex: { flex: 1 },

  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  leafCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#22c55e",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  brandName: {
    fontSize: 34,
    fontWeight: "900",
    color: "#166534",
    marginTop: 15,
  },

  slogan: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 40,
  },

  formContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    elevation: 20,
  },

  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
  },

  subText: {
    color: "#64748b",
    marginBottom: 25,
  },

  inputGroup: { gap: 15, marginBottom: 25 },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
  },

  input: { flex: 1, marginLeft: 12 },

  loginButton: {
    backgroundColor: "#166534",
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    elevation: 5,
  },

  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: { color: "#64748b" },

  signUpText: {
    color: "#166534",
    fontWeight: "700",
  },
});