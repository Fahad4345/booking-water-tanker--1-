import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupplierTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["right", "left", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            backgroundColor: "#fff",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            marginBottom: 4,
          },
        }}
      >
        <Tabs.Screen
          name="homeScreen"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tankerRegistration"
          options={{
            title: "Tankers",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
