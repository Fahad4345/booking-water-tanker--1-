import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { acceptOrder } from "../api/tankerProvider/acceptOrder";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Dimensions,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useUser } from "../context/context";
import RouteMap from "../components/DriverMap";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Location from 'expo-location';

const { width, height } = Dimensions.get("window");

const DriverRideScreen = () => {
  const [rideStatus, setRideStatus] = useState("Accepted"); 
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const { user, updateTankerStatus } = useUser();
  const router = useRouter();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    const initializeLocations = async () => {
      try {
        const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
        setOrderDetails(parsedOrder);

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });
        } else {
          Alert.alert("Location Permission Required", "Please enable location services to see the route.");
        }

        if (parsedOrder?.dropLocation) {
          await geocodeDestination(parsedOrder.dropLocation);
        } else {
          Alert.alert("Error", "No delivery address found in order details.");
        }
      } catch (error) {
        console.error("❌ Error initializing locations:", error);
        Alert.alert("Error", "Failed to load location data");
      } finally {
        setLoadingLocations(false);
      }
    };

    initializeLocations();
  }, [order]);

  const geocodeDestination = async (address) => {
    try {
      const results = await Location.geocodeAsync(address);
      
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setDestinationCoords({
          lat: latitude,
          lng: longitude
        });
      } else {
        setDestinationCoords({
          lat: 33.6844, 
          lng: 73.0479
        });
      }
    } catch (error) {
      console.error("❌ Error geocoding destination:", error);
      setDestinationCoords({
        lat: 33.6844, 
        lng: 73.0479
      });
    }
  };

  const handleCall = () => {
    const phone = orderDetails?.user?.phone || "+923001234567";
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      orderDetails.dropLocation || "Delivery Location"
    )}`;
    Linking.openURL(url);
  };

  const handleUpdateStatus = async (status) => {
    if (!user) {
      Alert.alert("Error", "User not found. Please login again.");
      return;
    }
    
    if (!user.Tanker._id) {
      Alert.alert("Error", "Tanker ID not found in user profile.");
      return;
    }
    
    if (!orderDetails?._id) {
      Alert.alert("Error", "Order ID not found.");
      return;
    }

    try {
      const data = await acceptOrder(orderDetails._id, status, user.Tanker._id);
      if (data) {
        setRideStatus(status);
      }
    } catch (error) {
      console.log("❌ Error in acceptOrder:", error);
    }
  };

  const handleStartFilling = () =>{ handleUpdateStatus("Filling"); setRideStatus("Filling");};
  const handleStartRide = () => {handleUpdateStatus("Enroute");setRideStatus("Enroute");};
  const handleArived = () => {handleUpdateStatus("Arrived");setRideStatus("Arrived");};
  const handleCompleteRide = async () => {
    try {
   
      await handleUpdateStatus("Completed");
      
   
      setRideStatus("Completed");
      
     
      await updateTankerStatus("Online", null);
      

      await AsyncStorage.multiRemove(['tankerStatus', 'currentOrder']);
      
      console.log("✅ Ride completed, status reset to Online");
      

      router.push("tabTanker/homeScreen");
    } catch (error) {
      console.error("❌ Error completing ride:", error);
      Alert.alert("Error", "Failed to complete ride. Please try again.");
    }
  };

  const renderActionButton = () => {
    if (rideStatus === "Accepted") {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartRide}>
          <Icon name="water-plus" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Start Ride</Text>
        </TouchableOpacity>
      );
    }  else if (rideStatus === "Enroute") {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleArived}>
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Arrived</Text>
        </TouchableOpacity>
      );
    } else if (rideStatus === "Arrived") {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartFilling}>
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Start Filling</Text>
        </TouchableOpacity>
      );
    } 
    else {
      return (
        <TouchableOpacity style={[styles.primaryButton, styles.completedButton]} onPress={()=> { handleCompleteRide();router.push("/tabTanker/homeScreen");}}>
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Complete Delivery</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <RouteMap 
          currentLocation={currentLocation}
          destination={destinationCoords}
        />
        <TouchableOpacity style={styles.navigateFloatingButton} onPress={handleNavigate}>
          <Icon name="navigation" size={24} color="#FFF" />
        </TouchableOpacity>

        
      </View>

      {/* Order Details Card - FIXED */}
      <View style={styles.detailsCard}>
        {/* Header Section with Customer Info */}
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarContainer}>
              <Icon name="account" size={32} color="#4FC3F7" />
            </View>
            <View style={styles.customerTextContainer}>
              <Text style={styles.customerName}>
                {orderDetails?.user?.name || "Customer"}
              </Text>
              <Text style={styles.customerLabel}>Customer</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Icon name="phone" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Order Details Section */}
        <View style={styles.orderDetailsSection}>
          {/* Location */}
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Icon name="map-marker" size={20} color="#4FC3F7" />
            </View>
            <Text style={styles.locationText} numberOfLines={2}>
              {orderDetails?.dropLocation || "No location provided"}
            </Text>
          </View>

          {/* Price and Water Amount */}
          <View style={styles.priceWaterRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Amount</Text>
              <Text style={styles.priceValue}>
                {orderDetails?.price ? `PKR ${orderDetails.price}` : "PKR --"}
              </Text>
            </View>
            
            <View style={styles.waterContainer}>
              <Text style={styles.waterLabel}>Capacity</Text>
              <View style={styles.waterAmountBadge}>
                <Icon name="water" size={18} color="#FFF" />
                <Text style={styles.waterAmountText}>
                  {orderDetails?.tankSize || "0"} L
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions (if any) */}
        {orderDetails?.instruction && (
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionIconWrapper}>
              <Icon name="information-outline" size={18} color="#FF9800" />
            </View>
            <Text style={styles.instructionsText}>
              {orderDetails.instruction}
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.bottomContainer}>
        {renderActionButton()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5" 
  },
  mapContainer: {
    height: height * 0.49, 
    position: "relative",
    backgroundColor: "#E8F4F8",
  },
  navigateFloatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4FC3F7",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  distanceBadge: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
  },
  
  detailsCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  
    minHeight: 220,
  },
  

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E1F5FE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4FC3F7",
  },
  customerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 2,
  },
  customerLabel: {
    fontSize: 13,
    color: "#757575",
    fontWeight: "500",
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4FC3F7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
 
  orderDetailsSection: {
    gap: 16,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E1F5FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
    paddingTop: 8,
  },
  

  priceWaterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
  priceContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#4FC3F7",
  },
  priceLabel: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "600",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
  },
  waterContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#00ACC1",
  },
  waterLabel: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "600",
    marginBottom: 6,
  },
  waterAmountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00ACC1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  waterAmountText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 6,
  },
  

  instructionsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  instructionIconWrapper: {
    marginRight: 10,
    marginTop: 2,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: "#5D4037",
    lineHeight: 18,
  },
  

  bottomContainer: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  primaryButton: {
    backgroundColor: "#4FC3F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 12,
  },
  completedButton: { 
    backgroundColor: "#4CAF50",
  },
});

export default DriverRideScreen;