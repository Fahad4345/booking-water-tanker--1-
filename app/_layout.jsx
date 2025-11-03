import { Stack } from "expo-router";
import { UserProvider } from "../context/provider";
import { useUser } from "../context/context";
import React from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function LayoutContent() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4FC3F7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      {/* include bottom so screens and tab bars have white background under them */}
      <SafeAreaView edges={['right', 'left',]} style={{ flex: 1, backgroundColor: '#fff' }}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth Screens */}
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <LayoutContent />
    </UserProvider>
  );
}
