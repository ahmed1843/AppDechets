import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Design";



export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            color: Colors.textPrimary,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "SmartWaste", headerShown: true }}
        />
        <Stack.Screen
          name="driver"
          options={{ title: "Driver Mode", headerBackTitle: "Home" }}
        />
        <Stack.Screen
          name="user"
          options={{ title: "Resident Mode", headerBackTitle: "Home" }}
        />
        <Stack.Screen
          name="map"
          options={{ title: "Live Tracking", headerBackTitle: "Back" }}
        />
      </Stack>
    </>
  );
}
