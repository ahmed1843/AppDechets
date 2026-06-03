import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RoleCard } from "../components/ui/RoleCard";
import { Colors } from "../constants/Design";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SW</Text>
          </View>
          <Text style={styles.headline}>Déchets{"\n"}intelligents</Text>
          <Text style={styles.subheadline}>
            Une gestion connectée pour un futur urbain plus propre.
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>Choisissez votre rôle</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Role Cards Section */}
        <View style={styles.cards}>
          <RoleCard
            title="Pilote"
            description="Gérez votre itinéraire de recouvrement et diffusez votre position GPS."
            icon="🚛"
            accentColor={Colors.accent}
            onPress={() => router.push("/driver")}
            accessibilityLabel="Rôle Pilote"
          />
          
          <RoleCard
            title="Résident"
            description="Suivez le camion dans votre secteur et signalez des dépôts sauvages."
            icon="🏠"
            accentColor={Colors.truckBlue}
            onPress={() => router.push("/user")}
            accessibilityLabel="Rôle Résident"
          />

          {/* NOUVELLE CARTE : ADMINISTRATEUR */}
          <RoleCard
            title="Administrateur"
            description="Supervisez les signalements, gérez la flotte et analysez les statistiques."
            icon="📊"
            accentColor={Colors.warning} // Utilisation du orange pour différencier
            onPress={() => router.push("/admin")}
            accessibilityLabel="Rôle Administrateur"
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>v1.0.0 — Smart City Initiative 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, paddingTop: 40 },
  hero: { alignItems: "center", paddingVertical: 30 },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.accentDim,
    borderWidth: 1.5,
    borderColor: Colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: { color: Colors.accent, fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  headline: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  subheadline: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, marginTop: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border, marginHorizontal: 12 },
  dividerLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cards: { marginTop: 10 },
  footer: { textAlign: "center", color: Colors.textMuted, fontSize: 11, marginTop: 40, letterSpacing: 0.4 },
});
