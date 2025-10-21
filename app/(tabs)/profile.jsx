import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DrawerMenu from '../../components/DrawerMenu';

export default function ProfileScreen() {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.replace('/') }
    ]);
  };

  const menuItems = [
    { icon: '👤', title: 'Edit Profile' },
    { icon: '📍', title: 'Saved Addresses' },
    { icon: '💳', title: 'Payment Methods' },
    { icon: '🔔', title: 'Notifications' },
    { icon: '❓', title: 'Help & Support' },
    { icon: '⚙️', title: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsDrawerOpen(true)}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}><Text style={styles.avatar}>👤</Text></View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Orders</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>3</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>$890</Text><Text style={styles.statLabel}>Spent</Text></View>
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Drawer Menu */}
      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        currentScreen="profile"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  scrollContent: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4FC3F7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatar: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 4 },
  email: { fontSize: 14, color: '#666' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 3 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#4FC3F7', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 24, elevation: 3 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 24, marginRight: 12 },
  menuTitle: { fontSize: 16, color: '#333' },
  menuArrow: { fontSize: 24, color: '#999' },
  logoutButton: { backgroundColor: '#FF5252', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
