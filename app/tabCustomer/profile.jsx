import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DrawerMenu from '../../components/DrawerMenu';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Auth } from '../../api/Auth';
import { useUser } from '../../context/context';
export default function ProfileScreen() {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, clearUser, setUser } = useUser();

  const { logout } = Auth();




  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
           
            
           
            const result = await logout();
            console.log("Logged out successfully:", result);
            const res =await clearUser();
            router.push("/");
            

            
          
          } catch (err) {
            console.error("Logout error:", err);
          }
        }
      }
    ]);
  };


  const menuItems = [
    { icon: '👤', title: 'Edit Profile', onPress: () => router.push('/tabCustomer/editProfile') },
    { icon: '📍', title: 'Saved Addresses', onPress: () => { } },

    { icon: '🔔', title: 'Notifications', onPress: () => { } },
    { icon: '⚙️', title: 'Settings', onPress: () => { } },
  ];

  return (
    <SafeAreaView>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
   
   

    <View style={styles.header}>
    
    <TouchableOpacity  onPress={()=> router.back()} style={styles.iconButton}>
      <Ionicons name="arrow-back-outline" size={24} color="#333" />
    </TouchableOpacity>
    <View style={styles.headerContent}>
      <Text style={styles.title}>My Profile</Text>

    </View>
  </View>


<View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}><Text style={styles.avatar}>👤</Text></View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}><Text style={styles.statNumber}>12</Text><Text style={styles.statLabel}>Orders</Text></View>
        <View style={styles.statBox}><Text style={styles.statNumber}>3</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statBox}><Text style={styles.statNumber}>$890</Text><Text style={styles.statLabel}>Spent</Text></View>
      </View>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
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




    </View>
   </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {  backgroundColor: '#f5f5f5',  padding:20 },
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
      marginLeft:80
  },
  scrollContent: {},
  title: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4FC3F7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatar: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 4 },
  email: { fontSize: 14, color: '#666' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 3 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#4FC3F7', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, elevation: 3 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 24, marginRight: 12 },
  menuTitle: { fontSize: 16, color: '#333' },
  menuArrow: { fontSize: 24, color: '#999' },
  logoutButton: { backgroundColor: '#FF5252', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
