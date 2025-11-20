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
  const [isTracking, setIsTracking] = useState(false);
  const [tankerLocations, setTankerLocations] = useState([]);
  const [locationInterval, setLocationInterval] = useState(null);

  useEffect(() => {
    const initializeLocations = async () => {
      try {
        const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
        setOrderDetails(parsedOrder);

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          
          await getCurrentLocation();
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

 
    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [order]);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString()
      };
      
      console.log("📍 Current location:", newLocation);
      
      setCurrentLocation(newLocation);
      
    
      setTankerLocations(prev => {
        const updated = [...prev, newLocation];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
      
      return newLocation;
    } catch (error) {
      console.error("❌ Error getting current location:", error);
      return null;
    }
  };

  const startLocationTracking = () => {
    console.log("🚛 Starting location tracking...");
    setIsTracking(true);
    
    
    getCurrentLocation();
    
 
    const interval = setInterval(async () => {
      await getCurrentLocation();
    }, 5000); 
    
    setLocationInterval(interval);
  };

  const stopLocationTracking = () => {
    console.log("🛑 Stopping location tracking...");
    setIsTracking(false);
    
    if (locationInterval) {
      clearInterval(locationInterval);
      setLocationInterval(null);
    }
  };

  const geocodeDestination = async (address) => {
    try {
      console.log("📍Attempting to geocode:", address);
      
      const results = await Location.geocodeAsync(address);
      
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setDestinationCoords({
          lat: latitude,
          lng: longitude
        });
        console.log("✅ Geocoding successful");
      } else {
        // If no results, use fallback
        console.log("❌ No results, using fallback");
        useFallbackCoordinates();
      }
    } catch (error) {
      console.log("❌ Geocoding failed, but we're handling it:", error.message);
      useFallbackCoordinates();
    }
  };
  
  const useFallbackCoordinates = () => {
    console.log("🔄 Using fallback coordinates");
    setDestinationCoords({
      lat: 33.6844, 
      lng: 73.0479
    });
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

  const handleStartFilling = () => { 
    handleUpdateStatus("Filling"); 
    setRideStatus("Filling");

    stopLocationTracking();
  };

  const handleStartRide = () => {
    handleUpdateStatus("Enroute");
    setRideStatus("Enroute");
  
    startLocationTracking();
  };

  const handleArived = () => {
    handleUpdateStatus("Arrived");
    setRideStatus("Arrived");
   
    stopLocationTracking();
  };

  const handleCompleteRide = async () => {
    try {
 
      stopLocationTracking();
      
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

  
  const handleRefreshLocation = async () => {
    await getCurrentLocation();
    Alert.alert("Location Updated", "Your current location has been refreshed.");
  };

  const renderActionButton = () => {
    if (rideStatus === "Accepted") {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartRide}>
          <Icon name="water-plus" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Start Ride</Text>
        </TouchableOpacity>
      );
    } else if (rideStatus === "Enroute") {
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
    } else {
      return (
        <TouchableOpacity style={[styles.primaryButton, styles.completedButton]} onPress={handleCompleteRide}>
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Complete Delivery</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
   
      <View style={styles.mapContainer}>
        <RouteMap 
          currentLocation={currentLocation}
          destination={destinationCoords}
          tankerLocation={currentLocation}
          tankerPath={tankerLocations}
        />
        
        {/* Floating Buttons */}
        {/* <View style={styles.floatingButtonsContainer}>
          <TouchableOpacity style={styles.navigateFloatingButton} onPress={handleNavigate}>
            <Icon name="navigation" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.refreshLocationButton} onPress={handleRefreshLocation}>
            <Icon name="refresh" size={20} color="#FFF" />
          </TouchableOpacity>
        </View> */}

        {/* Location Status Badge */}
        {/* <View style={[
          styles.locationStatusBadge,
          isTracking ? styles.trackingActive : styles.trackingInactive
        ]}>
          <Icon 
            name={isTracking ? "map-marker-radius" : "map-marker-off"} 
            size={16} 
            color={isTracking ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.locationStatusText}>
            {isTracking ? "Live Tracking" : "Tracking Off"}
          </Text>
        </View> */}

        {/* Location Coordinates (for debugging) */}
        {/* {currentLocation && (
          <View style={styles.coordinatesBadge}>
            <Text style={styles.coordinatesText}>
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </Text>
          </View>
        )} */}
      </View>

      {/* Order Details Card */}
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

     
        <View style={styles.orderDetailsSection}>
       
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Icon name="map-marker" size={20} color="#4FC3F7" />
            </View>
            <Text style={styles.locationText} numberOfLines={2}>
              {orderDetails?.dropLocation || "No location provided"}
            </Text>
          </View>

         
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

        
        <View style={styles.trackingInfoContainer}>
          <View style={styles.trackingInfoItem}>
            <Icon name="update" size={16} color="#4FC3F7" />
            <Text style={styles.trackingInfoText}>
              Updates: Every 5 seconds
            </Text>
          </View>
          <View style={styles.trackingInfoItem}>
            <Icon name="history" size={16} color="#4FC3F7" />
            <Text style={styles.trackingInfoText}>
              Points: {tankerLocations.length}
            </Text>
          </View>
        </View>

      
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
  floatingButtonsContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    gap: 12,
  },
  navigateFloatingButton: {
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
  refreshLocationButton: {
    backgroundColor: "#FF9800",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationStatusBadge: {
    position: "absolute",
    top: 50,
    left: 20,
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
  trackingActive: {
    backgroundColor: "#E8F5E8",
  },
  trackingInactive: {
    backgroundColor: "#FFEBEE",
  },
  locationStatusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  coordinatesBadge: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coordinatesText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "500",
  },
  trackingInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  trackingInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trackingInfoText: {
    fontSize: 12,
    color: "#666",
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