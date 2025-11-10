import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["right", "left", "bottom" ]}>
     <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 50,
            paddingBottom: 8,
            backgroundColor: "#fff",
            borderTopWidth: 0,
            borderTopColor: "transparent",
            elevation: 0,
            shadowOpacity: 0,
            shadowColor: "transparent",
          },
          tabBarLabelStyle: {},
        }}
      >

        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
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
        <Tabs.Screen
          name="orderDetail"
          options={{
            href: null, // 🚫 hides it from the tab bar
          }}
        />
        <Tabs.Screen
          name="payment"
          options={{
            href: null, // 🚫 hides it from the tab bar
          }}
        />
          <Tabs.Screen
          name="editProfile"
          options={{
            href: null, // 🚫 hides it from the tab bar
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
