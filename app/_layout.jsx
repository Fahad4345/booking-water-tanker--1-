import { Stack } from "expo-router";
import { UserProvider } from "../context/provider";
import { useUser } from "../context/context";
import React from "react";
import { View, ActivityIndicator } from "react-native";

function LayoutContent() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4FC3F7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <LayoutContent />
    </UserProvider>
  );
}
