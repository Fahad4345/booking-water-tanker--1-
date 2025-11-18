import React, { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useUser } from "../context/context";
import { isLoading } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthWrapper({ children }) {
  const { user, isLoading: userLoading, isAuthenticated } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);


useEffect(() => {
  console.log("Auth Wrapper", user, isAuthenticated);

  const checkAuthAndNavigate = async () => {
    if (isAuthenticated && user?.role) {
      console.log("✅ User authenticated:", user.role);
      console.log("📊 Tanker availability from context:", user.Tanker?.availabilityStatus);

      let targetRoute;

      if (user.role === "Supplier") {
        targetRoute = "/tabSupplier/homeScreen";
      } 
      else if (user.role === "Tanker") {
 
        const storedTankerStatus = await AsyncStorage.getItem('tankerStatus');
        const storedOrder = await AsyncStorage.getItem('currentOrder');
        
        console.log("🔍 Stored tankerStatus:", storedTankerStatus);
        console.log("🔍 Stored order exists:", !!storedOrder);


        const effectiveStatus = user.Tanker?.availabilityStatus || storedTankerStatus;
        
        if (effectiveStatus === "OnRide" && storedOrder) {
          console.log("🎯 Tanker is on ride, navigating to accepted order");
          router.replace({
            pathname: '/acceptedOrderScreen',
            params: { order: storedOrder }
          });
          return;
        } else {
          console.log("🏠 Tanker is available, navigating to home");
          targetRoute = "/tabTanker/homeScreen";
        }
      } 
      else {
        targetRoute = "/tabCustomer/home";
      }

      if ((pathname === "/" || pathname === "/login") && targetRoute) {
        console.log("📍 Navigating to:", targetRoute);
        router.replace(targetRoute);
      }
    } 
    else if (!isAuthenticated && pathname !== "/") {
      hasRedirected.current = true;
      router.replace("/");
    }
  };

  checkAuthAndNavigate();
}, [userLoading, isAuthenticated, user?.role, pathname]);

if (userLoading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4FC3F7" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

  return <>{children}</>;
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});