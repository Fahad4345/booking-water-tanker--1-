import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { GetBookings } from '../../api/bookings/GetBooking';
import { useUser } from '../../context/context';
import EventBus from '../../utils/EventBus';

export default function BookingsScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, clearUser } = useUser();

  const getTankLabel = (size) => {
    switch (Number(size)) {
      case 6000:
        return "Small";
      case 12000:
        return "Medium";
      case 15000:
        return "Large";
      case 22000:
        return "XL";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const UserId = user._id;
        const result = await GetBookings(UserId);
        setLoading(false);
  
        if (result?.success) {
          setBookings(result.data || []);
        } else {
          console.log("❌ Failed:", result?.message);
          setBookings([]); // ensure it's empty
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setLoading(false);
        setBookings([]); // fallback
      }
    };
  
    fetchBookings();
  }, []); // re-run if user changes
  

  const getStatusColor = (status) => status === 'In Transit' ? '#FF9800' : '#4CAF50';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
       
       <TouchableOpacity  onPress={()=> router.back()} style={styles.iconButton}>
         <Ionicons name="arrow-back-outline" size={24} color="#333" />
       </TouchableOpacity>
       <View style={styles.headerContent}>
         <Text style={styles.title}>My Bookings</Text>

       </View>
     </View>
     
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4FC3F7" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="water-outline" size={60} color="#999" />
          <Text style={styles.noBookingText}>No bookings yet</Text>
          <Text style={styles.noBookingSubtext}>
            Book a tanker to see your orders here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {bookings.map((booking) => (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/tabCustomer/orderDetail',
                params: { order: JSON.stringify(booking) },
              })}
              key={booking._id}
              style={styles.bookingCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingSize}>
                    {getTankLabel(booking.tankSize)}
                  </Text>
                  <Text style={styles.bookingCapacity}>
                    {booking.tankSize}L
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.bookingStatus || "Pending") },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {booking.bookingStatus || "Pending"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.detailValue}>
                    📍 {booking.dropLocation}
                  </Text>
                  <Text style={styles.priceValue}>💰 Rs {booking.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {  flex:1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flex: 1,
     marginLeft:60
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
   
    
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  bookingSize: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },
  bookingCapacity: {
    fontSize: 14,
    color: '#666'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4FC3F7'
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noBookingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 8,
  },
  noBookingSubtext: {
    fontSize: 14,
    color: "#888"
  },
});