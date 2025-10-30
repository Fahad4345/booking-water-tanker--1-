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
    console.log("Auth Wrapper",user, isAuthenticated);
     
    if (isAuthenticated && user?.role) {
   
      const targetRoute = user.role === "Supplier" ?  "/tabSupplier/homeScreen":"/tabCustomer/home" ;
      
      // Only redirect if we're on the login page
      if (pathname === "/" || pathname === "/login") {
        router.replace(targetRoute);
      }
    } else if (!isAuthenticated && pathname !== "/") {
      hasRedirected.current = true;
      router.replace("/");
    }
  }, [userLoading, isAuthenticated, user?.role, pathname]);

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // ✅ Always render children - let the routing handle the rest
  return <>{children}</>;
}
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});