import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

export default function AuthWrapper({ children }) {
  const { user, isLoading: userLoading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, userLoading]);

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If authenticated, don't render children (user will be navigated to tabs)
  if (isAuthenticated) {
    return null;
  }

  // If not authenticated, show the welcome screen
  return children;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
