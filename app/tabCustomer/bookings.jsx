
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RefreshControl } from "react-native";

import { GetBookings } from "../../api/bookings/GetBooking";
import { useUser } from "../../context/context";
import eventBus from "../../utils/EventBus";

export default function BookingsScreen() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, clearUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const subscriptions = [];

    subscriptions.push(
      eventBus.addListener("NewBookingCreated", () => {
    
       console.log("New booking");
        
        
     
          fetchBookings();
    
      })
    );
    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, []);
  const onRefresh = async () => {
     
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

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

  const fetchBookings = async () => {
    try {
      setLoading(true);
      if (!user || !user._id) {
        console.log("No user logged in — skipping booking fetch");
        return;
      }
      const UserId = user._id;
      const result = await GetBookings(UserId);
      setLoading(false);

      if (result?.success) {
        
        setBookings(result.data || []);
       
      } else {
        console.log("❌ Failed:", result?.message);
        setBookings([]); 
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setLoading(false);
      setBookings([]); 
    }
  };

  const handleCancelBooking = (orderId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(
                `http://192.168.100.187:5000/booking/cancelBooking`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    bookingId: orderId,
                  }),
                }
              );

              const data = await response.json();

              if (data.success) {
                Alert.alert("✅ Success", "Wait For Approval of Refund by Admin", [
                  {
                    text: "OK",
                    onPress: () => {
              
                      fetchBookings();
                    },
                  },
                ]);
              } else {
                setLoading(false);
                Alert.alert(
                  "⚠️ Failed",
                  data.message || "Something went wrong"
                );
              }
            } catch (error) {
              setLoading(false);
              console.error("Cancel Booking Error:", error);
              Alert.alert(" Error", "Server error occurred");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchBookings();
  }, [user]); 

  const getStatusColor = (status) => {
    switch (status) {
      case "In Transit":
        return "#FF9800";
      case "Cancelled":
        return "#F44336";
      case "Completed":
        return "#4CAF50";
      case "Pending":
        return "#FFC107";
      default:
        return "#9E9E9E";
    }
  };


  const canCancelBooking = (status) => {
    const cancellableStatuses = ["Pending", "Confirmed", "Scheduled"];
    return cancellableStatuses.includes(status);
  };

  return (
    <View style={styles.container}   >
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}


      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          
        >
          <Ionicons name="arrow-back-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Bookings</Text>
        </View>
      </View>

      {loading ?  (
  <View style={styles.loadingCenter}>
  <ActivityIndicator size="large" color="#4FC3F7" />
  <Text style={styles.loadingText}>Loading orders...</Text>
</View>
): bookings.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="water-outline" size={60} color="#999" />
          <Text style={styles.noBookingText}>No bookings yet</Text>
          <Text style={styles.noBookingSubtext}>
            Book a tanker to see your orders here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4FC3F7"]} 
              tintColor="#4FC3F7" 
              title="Refreshing..." 
              titleColor="#4FC3F7"
            />
          }
        >
          {bookings.map((booking) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/tabCustomer/orderDetail",
                  params: { order: JSON.stringify(booking) },
                })
              }
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

                <View style={{ justifyContent: "space-between" }}>
                  {canCancelBooking(booking.bookingStatus) && (
                    <TouchableOpacity
                      onPress={() => handleCancelBooking(booking._id)}
                      style={{
                        backgroundColor: "orange",
                        alignSelf: "center",
                        paddingVertical: 6,
                        paddingHorizontal: 17,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={styles.statusText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(
                          booking.bookingStatus || "Pending"
                        ),
                        marginTop: canCancelBooking(booking.bookingStatus)
                          ? 10
                          : 0,
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {booking.bookingStatus || "Pending"}
                    </Text>
                  </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1,backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1976D2',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
    marginLeft: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  iconButton: {
    width: 40,
    height: 40,
   
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bookingSize: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  bookingCapacity: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4FC3F7",
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
    color: "#888",
  },
  loadingCenter: {
    flex: 1,
   
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  
});
