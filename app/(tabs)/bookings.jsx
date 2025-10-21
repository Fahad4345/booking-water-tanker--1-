import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DrawerMenu from '../../components/DrawerMenu';

export default function BookingsScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const bookings = [
    { id: 1, size: 'Medium Tanker', capacity: '2000 Liters', date: 'Oct 16, 2025', time: '2:30 PM', status: 'In Transit', address: '123 Main Street', price: '$90' },
    { id: 2, size: 'Small Tanker', capacity: '1000 Liters', date: 'Oct 14, 2025', time: '10:00 AM', status: 'Delivered', address: '456 Oak Avenue', price: '$50' },
  ];

  const getStatusColor = (status) => status === 'In Transit' ? '#FF9800' : '#4CAF50';

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
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Track your water deliveries</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {bookings.map(booking => (
          <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.bookingSize}>{booking.size}</Text>
                <Text style={styles.bookingCapacity}>{booking.capacity}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.detailValue}>📍 {booking.address}</Text>
            <Text style={styles.detailValue}>📅 {booking.date} at {booking.time}</Text>
            <Text style={styles.priceValue}>💰 {booking.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Drawer Menu */}
      <DrawerMenu 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        currentScreen="bookings"
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
  bookingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  bookingSize: { fontSize: 18, fontWeight: '700', color: '#333' },
  bookingCapacity: { fontSize: 14, color: '#666' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  detailValue: { fontSize: 14, color: '#333', marginBottom: 8 },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#4FC3F7' },
});
