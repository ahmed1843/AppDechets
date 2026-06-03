import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Design";

type BadgeStatus = "active" | "idle" | "warning" | "error";

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
}

const STATUS_CONFIG: Record<BadgeStatus, { bg: string; dot: string; text: string }> = {
  active: { bg: Colors.accentDim, dot: Colors.accent, text: Colors.accent },
  idle: { bg: Colors.surfaceHover, dot: Colors.textMuted, text: Colors.textSecondary },
  warning: { bg: Colors.warningDim, dot: Colors.warning, text: Colors.warning },
  error: { bg: Colors.dangerDim, dot: Colors.danger, text: Colors.danger },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.label, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 7,
    alignSelf: "flex-start",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
