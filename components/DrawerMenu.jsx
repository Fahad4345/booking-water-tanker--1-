import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function DrawerMenu({ isOpen, onClose, currentScreen }) {
  const router = useRouter();

  const menuItems = [
    { id: 'index', title: 'Home', icon: 'home', emoji: '🏠' },
    { id: 'bookings', title: 'Bookings', icon: 'list', emoji: '📋' },
    { id: 'profile', title: 'Profile', icon: 'person', emoji: '👤' },
  ];

  const handleNavigation = (screenId) => {
    onClose(); // Close drawer first
    setTimeout(() => {
      if (screenId === 'index') {
        router.replace('/(tabs)/');
      } else {
        router.replace(`/(tabs)/${screenId}`);
      }
    }, 300); // Wait for drawer animation to complete
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      />
      
      {/* Drawer */}
      <Animated.View style={styles.drawer}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuItems}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                currentScreen === item.id && styles.activeMenuItem
              ]}
              onPress={() => handleNavigation(item.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.menuIcon,
                currentScreen === item.id && styles.activeMenuIcon
              ]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[
                styles.menuText,
                currentScreen === item.id && styles.activeMenuText
              ]}>
                {item.title}
              </Text>
              {currentScreen === item.id && (
                <Ionicons name="checkmark" size={20} color="#4FC3F7" />
              )}
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
    width: width * 0.7, // 70% of screen width
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
});
