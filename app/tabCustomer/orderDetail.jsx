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

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { getTankerByCapacity } from "../../api/suppliers/getTankerByCapacity";
import { assignOrderToTanker } from "../../api/suppliers/assignOrder";
import { useUser } from '../../context/context';
import OpenStreetMapView from './../../components/OpenStreetMap';
import ReadOnlyMap from "../../components/readOnlyMap";
import { onTankerLocation, socket,registerUser, onTrackingStopped } from "../../utils/socket";

const { width, height } = Dimensions.get("window");

const OrderDetailScreen = () => {
  const router = useRouter();
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const { user } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [tankers, setTankers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tankerLocation, setTankerLocation] = useState(null);
  const [tankerPath, setTankerPath] = useState([]);
 

  const [isLiveTracking, setIsLiveTracking] = useState(false); 

  useEffect(() => {
    try {
      const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
      console.log("Parsed Order", parsedOrder.deliveryTime);
      setOrderDetails(parsedOrder);
    } catch (error) {
      console.log("Error parsing order:", error);
    }
  }, [order]);

  useEffect(() => {
    if (!orderDetails || !user) return;
  
    const orderId = orderDetails._id;
    const userId = user._id;
  
    console.log("🔧 Setting up socket listeners for order:", orderId, "user:", userId);
  
    registerUser(userId);
  
    const handleTankerLocation = (data) => {
      console.log("📍 Received tanker location:", data);
      if (data.orderId === orderId) {
        const newLocation = {
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp
        };
        
        setTankerLocation(newLocation);
        setTankerPath(prev => [...prev, newLocation].slice(-100)); 
        setIsLiveTracking(true);
        console.log("✅ Live tracking ACTIVE");
      }
    };
  
    const handleTrackingStopped = (data) => {
      console.log("🛑 RECEIVED tracking stopped event:", data);
      console.log("🔍 Expected orderId:", orderId, "Received orderId:", data.orderId);
      
      if (data.orderId === orderId) {
        setTankerLocation(null);
       
        setIsLiveTracking(false); 
        console.log("✅ SUCCESS: Cleared tanker tracking data - Live tracking INACTIVE");
        
        Alert.alert("✅ Order Delivered", " Your Order has been Delivered Sucessfully");
      }
    };
  

    onTankerLocation(handleTankerLocation);
    onTrackingStopped(handleTrackingStopped);
  
    return () => {
      console.log("🛑 Cleaning up socket listeners");
      socket.off('tankerLocation', handleTankerLocation);
      socket.off('trackingStopped', handleTrackingStopped);
    };
  }, [orderDetails, user]);

  if (!orderDetails) {
    return (
      <View style={styles.loader}>
        <Text>Loading order details...</Text>
      </View>
    );
  }
  
  const makeCall = () => {
    Linking.openURL(`tel:${orderDetails.supplierPhone || "03001234567"}`);
  };

    const extractDatePart = (deliveryTime) => {
      if (!deliveryTime) return "Not scheduled";
      return deliveryTime.split(' ').slice(0, 3).join(' ');
    };
  
    const extractTimePart = (deliveryTime) => {
      if (!deliveryTime) return "";
      return deliveryTime.split(' ').slice(3).join(' ');
    };
  
  



  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View  style={styles.mapContainer}>
       

<ReadOnlyMap
  tankerLocation={tankerLocation}
  address={orderDetails.dropLocation}
  showTankerTracking={true}

  isLiveTracking={isLiveTracking} 
/>
     

      </View>

      <View style={styles.contentContainer}>
       
        <View style={styles.topRow}>
          <View style={styles.compactSection}>
            <Text style={styles.miniLabel}>Price</Text>
            <View style={styles.priceTag}>
              {console.log(orderDetails.price)}
              <Text style={styles.priceText}>{orderDetails.price}</Text>
            </View>
          </View>
          <View style={styles.compactSection}>
            <Text style={styles.miniLabel}>Type</Text>
            <View style={styles.typeTag}>
              <Text style={styles.typeIcon}>🚚</Text>
              <Text style={styles.typeText}>{orderDetails.bookingType}</Text>
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
              <Text style={styles.infoValue} numberOfLines={1}>
                {orderDetails.dropLocation}
              </Text>
            </View>
          </View>
        </View>

     
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={styles.miniIconCircle}>
              <Text style={styles.miniEmoji}>🕐</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>{orderDetails.bookingType}</Text>
              <Text style={styles.infoValue}>
              {extractDatePart(orderDetails.deliveryTime)} at {extractTimePart(orderDetails.deliveryTime)}
              </Text>
            </View>
          </View>
        </View>

    
        {/* {orderDetails.instruction && (
          <View style={styles.instructionsCompact}>
            <Text style={styles.instructionsIcon}>📝</Text>
            <Text style={styles.instructionsText} numberOfLines={2}>
              {orderDetails?.instruction}
            </Text>
          </View>
        )} */}

       
        <View style={styles.customerRow}>
          <View style={styles.customerInfo}>
            <View style={styles.miniIconCircle}>
              <Text style={styles.miniEmoji}>👤</Text>
            </View>
            <View style={styles.customerTextBox}>
              <Text style={styles.infoLabel}>Supplier</Text>
              <Text style={styles.customerName}>{orderDetails.supplierName}</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={makeCall}>
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        
         
        </View>

    

      </View>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    height:  height * 0.45,
    position: "relative",
    backgroundColor: "#E5E7EB",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navigationButton: {
    position: "absolute",
    top: height * 0.25,
    right: 16,
    backgroundColor: "#4FC3F7",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    backgroundColor: '#f5f5f5',
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  compactSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  miniLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
    fontWeight: "500",
  },
  priceTag: {
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  typeTag: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FC3F7",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  infoRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4FC3F7",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  miniEmoji: {
    fontSize: 16,
  },
  infoTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: "black",
    fontWeight: "500",
  },
  instructionsCompact: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  instructionsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 12,
    color: "#374151",
  },
  customerRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  customerTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  customerName: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  phoneBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
  },
  phoneNumber: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  callButton: {
    backgroundColor: "#10B981",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  callButtonText: {
    fontSize: 16,
  },
  assignButton: {
    backgroundColor: "#4FC3F7",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  assignButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});

export default OrderDetailScreen;

