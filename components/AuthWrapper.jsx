import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useUser } from "../context/context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthWrapper({ children }) {
  const { user, isLoading: userLoading, isAuthenticated } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("🔐 Auth Wrapper State:", {
      isAuthenticated,
      userRole: user?.role,
      userLoading,
      pathname,
      hasRedirected: hasRedirected.current
    });

    const checkAuthAndNavigate = async () => {
      // Don't proceed if still loading
      if (userLoading) {
        console.log("⏳ Still loading user data...");
        return;
      }

      // Prevent multiple redirects
      if (hasRedirected.current) {
        console.log("🛑 Already redirected, skipping...");
        return;
      }

      setIsChecking(true);

      try {
        // Case 1: User is authenticated
        if (isAuthenticated && user?.role) {
          console.log("✅ User authenticated:", user.role);
          
          let targetRoute = null;

          if (user.role === "Supplier") {
            targetRoute = "/tabSupplier/homeScreen";
            console.log("🏭 Supplier route:", targetRoute);
          } 
          else if (user.role === "Tanker") {
            const [storedTankerStatus, storedOrder] = await Promise.all([
              AsyncStorage.getItem('tankerStatus'),
              AsyncStorage.getItem('currentOrder')
            ]);
            
            console.log("🔍 Tanker status:", storedTankerStatus);
            console.log("🔍 Stored order:", !!storedOrder);

            if (storedTankerStatus === "OnRide" && storedOrder) {
              console.log("🎯 Tanker on ride - navigating to accepted order");
              hasRedirected.current = true;
              router.replace({
                pathname: '/acceptedOrderScreen',
                params: { order: storedOrder }
              });
              return;
            } else {
              targetRoute = "/tabTanker/homeScreen";
            }
          } 
          else {
            targetRoute = "/tabCustomer/home";
          }

          // Only redirect from auth pages
          if ((pathname === "/" || pathname === "/login") && targetRoute) {
            console.log("📍 Redirecting to:", targetRoute);
            hasRedirected.current = true;
            router.replace(targetRoute);
          }
        } 
        // Case 2: User is NOT authenticated
        else if (!isAuthenticated && !userLoading) {
          const authRoutes = ["/", "/login"];
          if (!authRoutes.includes(pathname)) {
            console.log("🚫 No auth - redirecting to login");
            hasRedirected.current = true;
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Small delay to ensure state is stable
    const timer = setTimeout(checkAuthAndNavigate, 100);
    return () => clearTimeout(timer);
  }, [userLoading, isAuthenticated, user?.role, pathname]);

  // Show loading during initial check
  if (userLoading || isChecking) {
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
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});