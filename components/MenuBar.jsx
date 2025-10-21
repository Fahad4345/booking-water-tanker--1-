import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MenuBar({ currentScreen = 'index' }) {
  const router = useRouter();

  const menuItems = [
    { id: 'index', title: 'Home', icon: 'home', emoji: '🏠' },
    { id: 'bookings', title: 'Bookings', icon: 'list', emoji: '📋' },
    { id: 'profile', title: 'Profile', icon: 'person', emoji: '👤' },
  ];

  const handleNavigation = (screenId) => {
    console.log('Navigating to:', screenId); // Debug log
    Alert.alert('Menu Test', `Tapped on ${screenId}`); // Test alert
    try {
      if (screenId === 'index') {
        router.replace('/(tabs)/');
      } else {
        router.replace(`/(tabs)/${screenId}`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.menuBar}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.menuItem,
            currentScreen === item.id && styles.activeMenuItem
          ]}
          onPress={() => handleNavigation(item.id)}
          activeOpacity={0.5}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[
            styles.iconContainer,
            currentScreen === item.id && styles.activeIconContainer
          ]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <Text style={[
            styles.menuText,
            currentScreen === item.id && styles.activeMenuText
          ]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 60,
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
  },
  activeMenuItem: {
    backgroundColor: '#E3F2FD',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#4FC3F7',
  },
  emoji: {
    fontSize: 18,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeMenuText: {
    color: '#4FC3F7',
    fontWeight: '600',
  },
});
