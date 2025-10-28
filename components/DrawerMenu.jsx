import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';

import { useUser } from '../context/context';  

const { width } = Dimensions.get('window');

export default function DrawerMenu({ isOpen, onClose, currentScreen, user }) {
  const router = useRouter();
  const { isAuthenticated } = useUser();
 console.log("User", user)
  const customerMenuItems = [
    { id: 'index', title: 'Home', icon: 'home', emoji: '🏠', requiresAuth: false },
    { id: 'bookings', title: 'Bookings', icon: 'list', emoji: '📋', requiresAuth: true },
    { id: 'profile', title: 'Profile', icon: 'person', emoji: '👤', requiresAuth: true },
   

  ];
  const supplierMenuItems = [
    { id: 'homeScreen', title: 'Home', icon: 'home', emoji: '🏠', requiresAuth: false },
    { id: 'registerTanker', title: 'Register Tanker', icon: 'list', emoji: '🚚', },
    { id: 'profile', title: 'Profile', icon: 'person', emoji: '👤', requiresAuth: true },

  ];




  const showLoginAlert = () => {
    Alert.alert(
      "Login Required",
      "Please login to access this feature.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          style: "default",
          onPress: () => {
            onClose();
            router.push('/login');
          }
        }
      ]
    );
  };

  const handleNavigation = (screenId, requiresAuth) => {
    onClose(); 

   
    if (requiresAuth && !isAuthenticated) {
      showLoginAlert();
      return;
    }

    setTimeout(() => {
      if (screenId === 'index') {
        router.replace('/(tabs)/');
      }
      else if (screenId === 'bookings') {
        router.replace('/(tabs)/bookings');
      }
      else if (screenId === 'profile') {
        router.replace('/(tabs)/profile');
      }
      else if (screenId === 'homeScreen') {
        router.replace('/supplier/homeScreen');
      }
      else if (screenId === 'registerTanker') {
        router.replace('/supplier/tankerRegistration');
      }
      else {
        router.replace(`/(tabs)/${screenId}`);
      }
    }, 100); 
  };

  if (!isOpen) return null;

  return (
    <>
     {isOpen && (
        <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      )}
     

  
      <Animated.View style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menu</Text>

        </View>

        <View style={styles.menuItems}>
          {user.role === "customer" ? customerMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                currentScreen === item.id && styles.activeMenuItem,
                item.requiresAuth && !isAuthenticated && styles.disabledMenuItem
              ]}
              onPress={() => handleNavigation(item.id, item.requiresAuth)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIcon,
                currentScreen === item.id && styles.activeMenuIcon,
                item.requiresAuth && !isAuthenticated && styles.disabledMenuIcon
              ]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[
                styles.menuText,
                currentScreen === item.id && styles.activeMenuText,
                item.requiresAuth && !isAuthenticated && styles.disabledMenuText
              ]}>
                {item.title}
              </Text>


            </TouchableOpacity>
          )) : supplierMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                currentScreen === item.id && styles.activeMenuItem,
                item.requiresAuth && !isAuthenticated && styles.disabledMenuItem
              ]}
              onPress={() => handleNavigation(item.id, item.requiresAuth)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIcon,
                currentScreen === item.id && styles.activeMenuIcon,
                item.requiresAuth && !isAuthenticated && styles.disabledMenuIcon
              ]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[
                styles.menuText,
                currentScreen === item.id && styles.activeMenuText,
                item.requiresAuth && !isAuthenticated && styles.disabledMenuText
              ]}>
                {item.title}
              </Text>


            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.drawerFooter}>
          <Text style={styles.footerText}>Water Tanker Booking</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  activeMenuItem: {
    backgroundColor: '#E3F2FD',
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeMenuIcon: {
    backgroundColor: '#4FC3F7',
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  activeMenuText: {
    color: '#4FC3F7',
    fontWeight: '600',
  },
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4FC3F7',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },

  disabledMenuItem: {
    opacity: 0.6,
  },
  disabledMenuIcon: {
    backgroundColor: '#f5f5f5',
  },
  disabledMenuText: {
    color: '#999',
  },
});
