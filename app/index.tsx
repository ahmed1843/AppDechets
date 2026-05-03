import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { API_URL } from "../services/api";

export default function LoginScreen() {
  const router = useRouter();
  
  // États pour stocker les saisies
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Champs vides", "Veuillez entrer votre email et votre mot de passe.");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // 1. Récupération du rôle
      const userRole = data.user.role; 

      // 2. Logique de redirection intelligente
      if (userRole === 'driver') {
        // Redirection directe vers le dashboard sombre du chauffeur
        router.replace("/driver"); 
      } 
      else if (userRole === 'admin') {
        // Si tu as un écran admin, sinon redirige vers roles
        router.replace("/roles"); 
} else {
  router.replace("/home"); // Redirige vers le nouvel accueil citoyen
}

    } else {
      Alert.alert("Erreur", data.message || "Email ou mot de passe incorrect.");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Erreur Réseau", "Le serveur est injoignable. Vérifiez Docker et votre IP.");
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex: 1}}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.leafCircle}>
            <Ionicons name="leaf" size={50} color="#22c55e" />
          </View>
          <Text style={styles.brandName}>EcoWaste</Text>
        </View>

        {/* --- FORMULAIRE --- */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Connexion</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#64748b" />
              <TextInput 
                style={styles.input} 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                keyboardType="email-address"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              <TextInput 
                style={styles.input} 
                placeholder="Mot de passe" 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* --- BOUTON DE CONNEXION --- */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          {/* --- LIEN VERS INSCRIPTION --- */}
          <TouchableOpacity 
            onPress={() => router.push("/register")} 
            style={{marginTop: 25, alignItems: 'center'}}
          >
            <Text style={{color: '#64748b', fontSize: 15}}>
              Pas encore de compte ? <Text style={{color: '#166534', fontWeight: 'bold'}}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FBF7" },
  header: { flex: 1, justifyContent: "center", alignItems: "center" },
  leafCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: "white", 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  brandName: { fontSize: 34, fontWeight: "900", color: "#166534", marginTop: 15 },
  formContainer: { 
    backgroundColor: "white", 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    padding: 30, 
    paddingBottom: 40, 
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  welcomeText: { fontSize: 28, fontWeight: "800", color: "#1e293b", marginBottom: 20 },
  inputGroup: { gap: 15, marginBottom: 25 },
  inputWrapper: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#F1F5F9", 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    height: 60,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: "#1e293b" },
  loginButton: { 
    backgroundColor: "#166534", 
    height: 60, 
    borderRadius: 15, 
    justifyContent: "center", 
    alignItems: "center",
    elevation: 3
  },
  loginButtonText: { color: "white", fontSize: 18, fontWeight: "700" }
});
