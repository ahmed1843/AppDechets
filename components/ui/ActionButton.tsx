import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { Colors } from "../../constants/Design";

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger" | "ghost";
  loading?: boolean;
  style?: ViewStyle;
}

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  style,
}: ActionButtonProps) {
  const bgColor =
    variant === "primary"
      ? Colors.accent
      : variant === "danger"
      ? Colors.danger
      : "transparent";

  const textColor =
    variant === "primary"
      ? "#000"
      : variant === "danger"
      ? Colors.white
      : Colors.accent;

  const borderColor = variant === "ghost" ? Colors.accent : "transparent";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.button,
        { backgroundColor: bgColor, borderColor, borderWidth: variant === "ghost" ? 1.5 : 0 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
