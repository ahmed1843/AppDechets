import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/Design";

interface TruckMarkerProps {
  speed: number;
  heading: number;
}

export function TruckMarker({ speed, heading }: TruckMarkerProps) {
  return (
    <View style={styles.wrapper}>
      {/* Pulse ring */}
      <View style={styles.pulseOuter} />
      <View style={styles.pulseInner} />
      {/* Truck icon */}
      <View style={styles.truck}>
        <Text style={styles.truckIcon}>T</Text>
      </View>
      {/* Speed label */}
      <View style={styles.speedBadge}>
        <Text style={styles.speedText}>{speed} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
  },
  pulseOuter: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.truckBlueDim,
    borderWidth: 1,
    borderColor: Colors.truckBlue + "44",
  },
  pulseInner: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.truckBlue + "28",
  },
  truck: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.truckBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.truckBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  truckIcon: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  speedBadge: {
    position: "absolute",
    bottom: -2,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speedText: {
    color: Colors.truckBlue,
    fontSize: 10,
    fontWeight: "700",
  },
});
