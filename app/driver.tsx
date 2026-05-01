import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ActionButton } from "../components/ui/ActionButton";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Colors } from "../constants/Design";
import { MOCK_DRIVER, MOCK_ROUTES } from "../constants/mockData";
import { useTrackingState } from "../hooks/useTrackingState";

export default function DriverScreen() {
  const { isTracking, startTracking, stopTracking } = useTrackingState();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fake elapsed timer while tracking
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      setElapsedSeconds(0);
      pulseAnim.setValue(1);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Driver Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {MOCK_DRIVER.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.driverName}>{MOCK_DRIVER.name}</Text>
            <Text style={styles.driverMeta}>
              {MOCK_DRIVER.badge}  |  {MOCK_DRIVER.truck}
            </Text>
            <Text style={styles.driverMeta}>Shift: {MOCK_DRIVER.shift}</Text>
          </View>
          <StatusBadge
            status={isTracking ? "active" : "idle"}
            label={isTracking ? "Live" : "Offline"}
          />
        </View>

        {/* GPS Tracking Panel */}
        <View style={styles.trackingPanel}>
          <Text style={styles.sectionTitle}>GPS Tracking</Text>

          <View style={styles.trackingCenter}>
            <Animated.View
              style={[
                styles.trackingOrb,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isTracking
                    ? Colors.accentDim
                    : Colors.surfaceHover,
                  borderColor: isTracking ? Colors.accent : Colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.orbInner,
                  {
                    backgroundColor: isTracking
                      ? Colors.accent
                      : Colors.textMuted,
                  },
                ]}
              />
            </Animated.View>

            <Text
              style={[
                styles.trackingStatus,
                { color: isTracking ? Colors.accent : Colors.textSecondary },
              ]}
            >
              {isTracking ? "Broadcasting Location" : "GPS Inactive"}
            </Text>

            {isTracking && (
              <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
            )}
          </View>

          {/* Stats Row */}
          {isTracking && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {(elapsedSeconds * 0.0078).toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={[styles.statBox, styles.statBorder]}>
                <Text style={styles.statValue}>28 km/h</Text>
                <Text style={styles.statLabel}>Speed</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {Math.floor(elapsedSeconds / 120)}
                </Text>
                <Text style={styles.statLabel}>Stops Done</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!isTracking ? (
            <ActionButton
              label="Start GPS Tracking"
              onPress={startTracking}
              variant="primary"
            />
          ) : (
            <ActionButton
              label="Stop Tracking"
              onPress={stopTracking}
              variant="danger"
            />
          )}

          <ActionButton
            label="View Live Map"
            onPress={() => router.push("/map")}
            variant="ghost"
            style={{ marginTop: 12 }}
          />
        </View>

        {/* Route List */}
        <View style={styles.routeSection}>
          <Text style={styles.sectionTitle}>Assigned Routes</Text>
          {MOCK_ROUTES.map((route) => (
            <View key={route.id} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text
                  style={[
                    styles.routeEta,
                    {
                      color:
                        route.eta === "Pending"
                          ? Colors.textMuted
                          : Colors.warning,
                    },
                  ]}
                >
                  {route.eta !== "Pending" ? "ETA: " : ""}{route.eta}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(route.completed / route.stops) * 100}%`,
                      backgroundColor:
                        route.completed === 0 ? Colors.textMuted : Colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.routeMeta}>
                {route.completed}/{route.stops} stops completed
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, paddingBottom: 40 },

  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: Colors.accentDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.accentSoft,
  },
  avatarText: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: "800",
  },
  profileInfo: { flex: 1 },
  driverName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  driverMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  trackingPanel: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  trackingCenter: {
    alignItems: "center",
    paddingVertical: 20,
  },
  trackingOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  orbInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 3,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  actions: { marginBottom: 24 },

  routeSection: {},
  routeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  routeName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  routeEta: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  routeMeta: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
