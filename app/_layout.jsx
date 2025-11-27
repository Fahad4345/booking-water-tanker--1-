// app/_layout.js (root layout)
import { Stack } from "expo-router";
import { UserProvider } from "../context/provider";
import { useUser } from "../context/context";
import { StripeProvider } from '@stripe/stripe-react-native';
import React from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function LayoutContent() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
         <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000" 
        translucent={false}
      />
        <ActivityIndicator size="large" color="#4FC3F7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['right', 'left','top','bottom']} style={{ flex: 1, }}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000" 
        translucent={false}
      />
        <Stack screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            // Auth screens
            <>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
            </>
          ) : (
           
            <>
              <Stack.Screen name="tabCustomer" />
              <Stack.Screen name="tabSupplier" />
              <Stack.Screen name="tabTanker" />
            </>
          )}
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51S90zX3hLambblRsM0nx1NdKtRw9smh8ePN12VMHMQQvsyjBNYaDwVUJPRj3qRBjTlpcNJILBcjoH1c8ZNA8JS7G00dd99U1yI"
      merchantIdentifier="merchant.com.yourapp" 
      urlScheme="yourapp"
    >
      <UserProvider>
        <LayoutContent />
      </UserProvider>
    </StripeProvider>
  );
}