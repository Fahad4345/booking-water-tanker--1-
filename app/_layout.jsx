import { Stack } from "expo-router";
import { UserProvider } from "../context/provider";
import { useUser } from "../context/context";
import React, { useState } from "react";
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DrawerMenu from "../components/DrawerMenu";

function LayoutContent() {
  const { isAuthenticated, isLoading, user } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = () => {
    console.log(isAuthenticated, 'authenticated-----')
    setIsDrawerOpen(true)
  };
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4FC3F7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    
      {isDrawerOpen && (
        <View style={styles.drawerOverlay}>
          <DrawerMenu
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            currentScreen="index"
            user={user}
          />
        </View>
      )}

  
      <Stack
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerBackVisible: false,
          headerLeft: () =>
            isAuthenticated ? (
              <TouchableOpacity style={{ marginLeft: 15, backgroundColor: 'red' }} onPress={handleOpenDrawer}>
                <Ionicons name="menu" size={28} color="#000" />
              </TouchableOpacity>
            ) : null,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="editProfile" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)", 
  },
});


export default function RootLayout() {
  return (
    <UserProvider>
      <LayoutContent />
    </UserProvider>
  );
}
