import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Design";

// 1. On définit toutes les propriétés autorisées ici
interface RoleCardProps {
  title: string;
  description: string;
  icon: string; 
  accentColor: string;
  onPress: () => void;
  accessibilityLabel?: string; // Le "?" signifie que c'est optionnel
}

export function RoleCard({ 
  title, 
  description, 
  icon, 
  accentColor, 
  onPress,
  accessibilityLabel 
}: RoleCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityLabel={accessibilityLabel} // On lie la propriété ici
      style={[styles.card, { borderColor: accentColor + "33" }]}
    >
      <View style={[styles.iconBox, { backgroundColor: accentColor + "18" }]}>
        <Text style={[styles.iconText, { color: accentColor }]}>{icon}</Text>
      </View>
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={[styles.arrow, { backgroundColor: accentColor + "22" }]}>
        <Text style={[styles.arrowText, { color: accentColor }]}>{"→"}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 14,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
    fontWeight: "700",
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
