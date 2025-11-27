



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Linking,
  Alert,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AssignTankerModal from "../../components/AssignModel";
import { getTankerByCapacity } from "../../api/suppliers/getTankerByCapacity";
import { assignOrderToTanker } from "../../api/suppliers/assignOrder";
import { useUser } from '../../context/context';
import OpenStreetMapView from './../../components/OpenStreetMap';
import { useUpdateStatus } from "../../components/updateStatus";

const { width, height } = Dimensions.get("window");
 

const OrderDetailScreen = () => {
  const router = useRouter();
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const { user } = useUser();
   const{handleUpdateStatus}= useUpdateStatus();

  const [showModal, setShowModal] = useState(false);
  const [tankers, setTankers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {


      console.log("user", user)
      const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
      setOrderDetails(parsedOrder);
       console.log("parsed order", parsedOrder);
    } catch (error) {
      console.log("Error parsing order:", error);
    }
  }, []);

  const loadTankers = async (tankSize) => {
    setLoading(true);
    try {
      const response = await getTankerByCapacity(user._id, tankSize);
      if (response && response.length > 0) {
        setTankers(
          response.map((t) => ({
            _id: t._id,
            name: t.fullName || t.vehicleNumber,
            vehicleNumber: t.vehicleNumber || 'N/A',
            capacity: t.capacity.toString(),
          }))
        );
      }
    } catch (err) {
      console.log("Error loading tankers:", err);
      setTankers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = async (tankerId) => {
    try {
      setShowModal(false);
      const response = await assignOrderToTanker(orderDetails._id, tankerId, user._id);

      if (response.success) {
        Alert.alert("✅ Success", "Order assigned successfully!");
        router.replace('/tabSupplier/homeScreen');
      } else {
        Alert.alert("⚠️ Failed", response.message || "Could not assign order.");
      }
    } catch (error) {
      console.error("Error assigning order:", error);
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
              const response = await fetch(`http://192.168.100.187:5000/stripe/cancel`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  bookingId: orderId,
                }),
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert("Success", data.message, [
                  {
                    text: "OK",
                    onPress: () => {
                     
                      router.push("/tabSupplier/homeScreen");
                    },
                  },
                ]);
              } else {
                setLoading(false);
                Alert.alert(" Failed", data.message || "Something went wrong");
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

  const handleNavigate = (dropLocation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      dropLocation || "Delivery Location"
    )}`;
    Linking.openURL(url);
  };

  if (!orderDetails) {
    return (
      <View style={styles.loader}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  const { price, bookingType, dropLocation, deliveryTime, instruction, userId , bookingStatus} = orderDetails;

  const extractDatePart = (deliveryTime) => {
    if (!deliveryTime) return "Not scheduled";
    return deliveryTime.split(' ').slice(0, 3).join(' ');
  };

  const extractTimePart = (deliveryTime) => {
    if (!deliveryTime) return "";
    return deliveryTime.split(' ').slice(3).join(' ');
  };

  const makeCall = () => {
    Linking.openURL(`tel:${orderDetails.user.phone || "03001234567"}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

  
      <View style={styles.mapContainer}>
        <View pointerEvents="none" style={styles.mapWrapper}>
          <OpenStreetMapView
            address={orderDetails.dropLocation}
            readOnly={true}
          />
        </View>
        
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={() => handleNavigate(orderDetails.dropLocation)}
          activeOpacity={0.7}
        >
          <Icon name="navigation" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
  
        <View style={styles.topRow}>
          <View style={styles.compactSection}>
            <Text style={styles.miniLabel}>Price</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{price}</Text>
            </View>
          </View>
          <View style={styles.compactSection}>
            <Text style={styles.miniLabel}>Type</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeIcon}>🚚</Text>
              <Text style={styles.typeText}>{bookingType}</Text>
            </View>
          </View>
        </View>


        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={styles.miniIconCircle}>
              <Text style={styles.miniEmoji}>📍</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {dropLocation}
              </Text>
            </View>
          </View>
        </View>

        {orderDetails.bookingType === "Scheduled" ? (
  <View style={styles.infoRow}>
    <View style={styles.infoItem}>
      <View style={styles.miniIconCircle}>
        <Text style={styles.miniEmoji}>🕐</Text>
      </View>
      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>Scheduled Delivery</Text>
        <Text style={styles.infoValue}>
          {extractDatePart(orderDetails.deliveryTime)} at {extractTimePart(orderDetails.deliveryTime)}
        </Text>
      </View>
    </View>
  </View>
) : (
  <View style={styles.infoRow}>
    <View style={styles.infoItem}>
      <View style={styles.miniIconCircle}>
        <Text style={styles.miniEmoji}>⚡</Text>
      </View>
      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>Delivery Type</Text>
        <Text style={styles.infoValue}>Immediate Delivery</Text>
      </View>
    </View>
  </View>
)}
      
        {instruction && (
          <View style={styles.instructionsCompact}>
            <Text style={styles.instructionsIcon}>📝</Text>
            <Text style={styles.instructionsText} numberOfLines={2}>
              {instruction}
            </Text>
          </View>
        )}

      
        <View style={styles.customerRow}>
          <View style={styles.customerInfo}>
            <View style={styles.miniIconCircle}>
              <Text style={styles.miniEmoji}>👤</Text>
            </View>
            <View style={styles.customerTextBox}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.customerName}>{orderDetails.user.name}</Text>
            </View>
          </View>
          <View style={styles.phoneBox}>
            <Text style={styles.phoneNumber}>
              {orderDetails.user.phone || "03001234567"}
            </Text>
            <TouchableOpacity style={styles.callButton} onPress={makeCall}>
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {orderDetails.bookingStatus == "Assigned" ? (
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => handleUpdateStatus(orderDetails)}
          >
            <Text style={styles.assignButtonText}>Accept Order</Text>
          </TouchableOpacity>
        ) : (
          <View
          style={[styles.assignButton,
             bookingStatus === 'Assigned' && { backgroundColor: '#ccc' }]}
         >
          <Text style={[styles.assignButtonText, bookingStatus === 'Assigned' && { color: '#666' },]}> {bookingStatus === "Assigned" && "Assigned"}
              {bookingStatus === "In Progress" && "In Progress"}
              {bookingStatus === "Completed" && "Completed"}
              {bookingStatus === "Cancelled" && "Cancelled"}
              </Text>
              </View>
           
          
        )}


      </ScrollView>

      <AssignTankerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        order={orderDetails}
        tankers={tankers}
        loading={loading}
        onAssign={handleAssignOrder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  mapContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  mapWrapper: {
    flex: 1,
  },
  navigationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#4FC3F7",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  compactSection: {
    flex: 1,
    marginHorizontal: 6,
  },
  miniLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
  },
  priceTag: {
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  infoRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4FC3F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  miniEmoji: {
    fontSize: 16,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    lineHeight: 18,
  },
  instructionsCompact: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 14,
    borderRadius: 12,
    alignItems: "flex-start",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  instructionsIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  customerRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  customerTextBox: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "600",
  },
  phoneBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  phoneNumber: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  callButton: {
    backgroundColor: "#10B981",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    fontSize: 16,
  },
  assignButton: {
    backgroundColor: "#4FC3F7",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 3,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default OrderDetailScreen;