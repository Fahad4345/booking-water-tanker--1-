import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef } from "react"; 
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
import { registerTanker, sendLocation,sendTrackingStopped } from "../utils/socket";
import * as Location from 'expo-location';
import RatingModal from "../components/RatingModel";
import OrderDetailScreen from "./tabCustomer/orderDetail";
import { updateOrderRating } from "../api/bookings/UpdateRating";
const { width, height } = Dimensions.get("window");

const DriverRideScreen = () => {
  const [rideStatus, setRideStatus] = useState("Accepted"); 
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const { user, updateTankerStatus } = useUser();
  const router = useRouter();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [tankerLocations, setTankerLocations] = useState([]);
  
 
  const handleRatingSubmit = async (ratingData) => {
    console.log("Supplier rating submitted:", ratingData);
    
    try {
      // API call with raterType as 'customer'
      const response = await updateOrderRating({
        rating: ratingData.rating,
        orderId:orderDetails._id,
        raterType: 'supplier', 
        userId: orderDetails.supplier._id,
      });
      
      // Update local order details - customer rating fields
      setOrderDetails(prev => ({
        ...prev,
        customerRating: ratingData.rating,
        
      
      }));
      
     
      
      Alert.alert(
        "⭐ Thank You!",
        "You have rated the supplier successfully!"
      );
      
      setShowRatingModal(false);
      router.replace("tabTanker/homeScreen");
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert(
        "❌ Error",
        error.response?.data?.message || "Failed to submit rating."
      );
    }
  };

  const locationIntervalRef = useRef(null);

  const[Ids, setIds]= useState({
    orderId:null,
    userId:null,
    supplierId:null,
    tankerId:null,
  });
// useEffect(()=>{
// AsyncStorage.clear();
// },{})
  useEffect(() => {
    const initializeLocations = async () => {
      try {
        const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
        console.log("Parsed Order", order);
        setOrderDetails(parsedOrder);
        setIds({
          orderId: parsedOrder?._id || null,
          userId: parsedOrder?.user?._id || null,
          supplierId: parsedOrder?.supplier?._id || null,
          tankerId: parsedOrder?.tanker?._id || null
        });

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
        console.error("Error initializing locations:", error);
        Alert.alert("Error", "Failed to load location data");
      } finally {
        setLoadingLocations(false);
      }
    };

    initializeLocations();

    
  }, [order]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const isWithinArrivalDistance = () => {
    if (!currentLocation || !destinationCoords) {
      console.log("❌ Missing location data");
      return false;
    }

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destinationCoords.lat,
      destinationCoords.lng
    );

    
    
    const isWithinRange = distance <= 200;
    
    if (!isWithinRange) {
      Alert.alert(
        "Too Far From Destination",
        `You need to be within 200 meters of the destination to mark as arrived. \n\nCurrent distance: ${distance.toFixed(0)} meters away.`,
        [{ text: "OK" }]
      );
    }
    
    return isWithinRange;
  };

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
  const getTrackingLocation = async () => {
    try {
      console.log("📍 Getting tracking location...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString()
      };
      
      console.log("📍 Sending location to server");
      sendLocation({
        orderId: Ids.orderId, 
        userId: Ids.userId, 
        lat: newLocation.lat,
        lng: newLocation.lng
      });
      
      setCurrentLocation(newLocation);
      setTankerLocations(prev => {
        const updated = [...prev, newLocation];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
      
      return newLocation;
    } catch (error) {
      console.error("❌ Error getting tracking location:", error);
      return null;
    }
  };

  const startLocationTracking = () => {
    console.log("🚛 Starting location tracking...");
    setIsTracking(true);
    
    
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    
   
    getTrackingLocation();
    
    
    locationIntervalRef.current = setInterval(async () => {
      await getTrackingLocation();
    }, 5000);
  };
 
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
      console.log("Error in acceptOrder:", error);
    }
  };

  const handleStartFilling = () => { 
    handleUpdateStatus("Filling"); 
    setRideStatus("Filling");
    
  };

  const handleStartRide = () => {
    try {
      console.log("IDs", Ids.tankerId, Ids.supplierId);
      registerTanker(Ids.tankerId, Ids.supplierId);
      handleUpdateStatus("Enroute");
      setRideStatus("Enroute");
      startLocationTracking();
    } catch (error) {
      console.error("Error starting ride:", error);
    }
  };

  const handleArived = () => {
    if (!isWithinArrivalDistance()) {
      return;
    }

    handleUpdateStatus("Arrived");
    setRideStatus("Arrived");
    
  };

 
const stopLocationTracking = () => {
  console.log("🛑 Stopping location tracking...");
  setIsTracking(false);
  

  if (Ids.orderId && Ids.userId) {
    console.log("📡 Sending tracking stopped event");
    sendTrackingStopped(Ids.orderId, Ids.userId);
  }
  
  if (locationIntervalRef.current) {
    clearInterval(locationIntervalRef.current);
    locationIntervalRef.current = null;
  } else {
    console.log("❌ No interval to clear");
  }
};

const handleCompleteRide = async () => {
  try {
    console.log("🏁 Completing ride, stopping tracking...");
    
  
    stopLocationTracking();
    
  
    await handleUpdateStatus("Completed");
    setRideStatus("Completed");
    
    await updateTankerStatus("Online", null);
    setShowRatingModal(true);
   
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
    } else if (rideStatus === "Enroute") {
      let distanceText = "Arrived";
      let buttonDisabled = false;
      
      if (currentLocation && destinationCoords) {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          destinationCoords.lat,
          destinationCoords.lng
        );
        
        if (distance > 200) {
          distanceText = `Too Far (${distance.toFixed(0)}m)`;
          buttonDisabled = true;
        } else {
          distanceText = `Arrived (${distance.toFixed(0)}m)`;
        }
      }

      return (
        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            buttonDisabled && styles.disabledButton
          ]} 
          onPress={handleArived}
          disabled={buttonDisabled}
        >
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>{distanceText}</Text>
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
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <RouteMap 
          currentLocation={currentLocation}
          destination={destinationCoords}
          tankerLocation={currentLocation}
          tankerPath={tankerLocations}
        />
        
        <TouchableOpacity
          style={styles.navigationButton}
          onPress={handleNavigate}
          activeOpacity={0.7}
        >
          <Icon name="navigation" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

 
      <View style={styles.detailsCard}>
      
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
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        type="customer"
        targetName={orderDetails?.user?.name}
        bookingId={orderDetails?._id}
        existingRating={null}
        onSubmit={handleRatingSubmit}
      />
    </View>
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
});

export default DriverRideScreen;
  






// import { useLocalSearchParams } from "expo-router";
// import React, { useEffect, useState, useRef } from "react"; 
// import { acceptOrder } from "../api/tankerProvider/acceptOrder";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Linking,
//   Dimensions,
//   Alert,
//   ScrollView,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { useRouter } from "expo-router";
// import { useUser } from "../context/context";
// import RouteMap from "../components/DriverMap";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { registerTanker, sendLocation,sendTrackingStopped } from "../utils/socket";
// import * as Location from 'expo-location';
// import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
// import axios from 'axios';
// import polyline from '@mapbox/polyline';
// import * as Speech from 'expo-speech'; // For voice guidance

// const { width, height } = Dimensions.get("window");

// const DriverRideScreen = () => {
//   const [rideStatus, setRideStatus] = useState("Accepted"); 
//   const { order } = useLocalSearchParams();
//   const [orderDetails, setOrderDetails] = useState(null);
//   const { user, updateTankerStatus } = useUser();
//   const router = useRouter();

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [destinationCoords, setDestinationCoords] = useState(null);
//   const [loadingLocations, setLoadingLocations] = useState(true);
//   const [isTracking, setIsTracking] = useState(false);
//   const [tankerLocations, setTankerLocations] = useState([]);
  
//   // NEW: Turn-by-turn navigation states
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [navigationInstructions, setNavigationInstructions] = useState([]);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [distanceToNextTurn, setDistanceToNextTurn] = useState(0);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [showNavigationPanel, setShowNavigationPanel] = useState(false);
  
//   const mapRef = useRef(null);
//   const locationIntervalRef = useRef(null);
//   const navigationCheckIntervalRef = useRef(null);

//   const[Ids, setIds]= useState({
//     orderId:null,
//     userId:null,
//     supplierId:null,
//     tankerId:null,
//   });

//   useEffect(() => {
//     const initializeLocations = async () => {
//       try {
//         const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
//         console.log("Parsed Order", order);
//         setOrderDetails(parsedOrder);
//         setIds({
//           orderId: parsedOrder?._id || null,
//           userId: parsedOrder?.user?._id || null,
//           supplierId: parsedOrder?.supplier?._id || null,
//           tankerId: parsedOrder?.tanker?._id || null
//         });

//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status === 'granted') {
//           await getCurrentLocation();
//         } else {
//           Alert.alert("Location Permission Required", "Please enable location services to see the route.");
//         }

//         if (parsedOrder?.dropLocation) {
//           await geocodeDestination(parsedOrder.dropLocation);
//         } else {
//           Alert.alert("Error", "No delivery address found in order details.");
//         }
//       } catch (error) {
//         console.error("Error initializing locations:", error);
//         Alert.alert("Error", "Failed to load location data");
//       } finally {
//         setLoadingLocations(false);
//       }
//     };

//     initializeLocations();

//     return () => {
//       // Cleanup intervals
//       if (locationIntervalRef.current) {
//         clearInterval(locationIntervalRef.current);
//       }
//       if (navigationCheckIntervalRef.current) {
//         clearInterval(navigationCheckIntervalRef.current);
//       }
//       Speech.stop();
//     };
//   }, [order]);

//   // NEW: Calculate free route using OSRM
//   const calculateRoute = async () => {
//     if (!currentLocation || !destinationCoords) {
//       Alert.alert("Error", "Please wait for location data");
//       return;
//     }

//     try {
//       Alert.alert("Calculating Route", "Finding the best route to destination...");
      
//       const response = await axios.get(
//         `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson&steps=true`
//       );

//       if (response.data.routes && response.data.routes.length > 0) {
//         const route = response.data.routes[0];
        
//         // Decode polyline to coordinates
//       // ✅ CORRECT - Use coordinates directly from GeoJSON
// const decodedCoords = route.geometry.coordinates.map(([lng, lat]) => ({
//   latitude: lat,
//   longitude: lng,
// }));
//         setRouteCoords(decodedCoords);

//         // Extract turn-by-turn instructions
//         const steps = route.legs[0].steps.map((step, index) => ({
//           id: index,
//           instruction: step.maneuver.instruction || getManeuverInstruction(step.maneuver),
//           distance: step.distance,
//           location: {
//             latitude: step.maneuver.location[1],
//             longitude: step.maneuver.location[0],
//           },
//           type: step.maneuver.type,
//           modifier: step.maneuver.modifier,
//         }));
        
//         setNavigationInstructions(steps);
        
//         // Speak first instruction
//         if (steps.length > 0) {
//           Speech.speak(`Route calculated. ${steps[0].instruction}`);
//         }

//         // Fit map to route
//         if (mapRef.current) {
//           mapRef.current.fitToCoordinates(
//             [{latitude: currentLocation.lat, longitude: currentLocation.lng}, 
//              {latitude: destinationCoords.lat, longitude: destinationCoords.lng}],
//             {
//               edgePadding: { top: 100, right: 100, bottom: 200, left: 100 },
//               animated: true,
//             }
//           );
//         }

//         Alert.alert("Success", `Route found! ${(route.distance / 1000).toFixed(1)} km, ${Math.round(route.duration / 60)} minutes`);
//         setShowNavigationPanel(true);
        
//         // Start navigation monitoring
//         if (isNavigating) {
//           startNavigationMonitoring();
//         }
//       }
//     } catch (error) {
//       console.error('Routing error:', error);
//       Alert.alert("Error", "Could not calculate route. Please check your connection.");
//     }
//   };

//   // NEW: Start turn-by-turn navigation
//   const startTurnByTurnNavigation = () => {
//     if (navigationInstructions.length === 0) {
//       Alert.alert("Error", "Please calculate a route first");
//       return;
//     }
    
//     setIsNavigating(true);
//     setShowNavigationPanel(true);
//     Speech.speak(`Starting navigation. ${navigationInstructions[0].instruction}`);
//     setCurrentStep(0);
    
//     startNavigationMonitoring();
//   };

//   // NEW: Monitor navigation progress
//   const startNavigationMonitoring = () => {
//     if (navigationCheckIntervalRef.current) {
//       clearInterval(navigationCheckIntervalRef.current);
//     }
    
//     navigationCheckIntervalRef.current = setInterval(() => {
//       checkNavigationProximity();
//     }, 3000);
//   };

//   // NEW: Check distance to next turn
//   const checkNavigationProximity = () => {
//     if (!currentLocation || navigationInstructions.length === 0 || currentStep >= navigationInstructions.length) {
//       return;
//     }

//     const nextStep = navigationInstructions[currentStep];
//     const distance = calculateDistance(
//       currentLocation.lat,
//       currentLocation.lng,
//       nextStep.location.latitude,
//       nextStep.location.longitude
//     );

//     setDistanceToNextTurn(distance);

//     // Announce when approaching turn
//     if (distance < 200 && distance > 50) {
//       Speech.speak(`In ${Math.round(distance)} meters, ${nextStep.instruction}`);
//     }
    
//     // Advance to next step when close
//     if (distance < 30 && currentStep < navigationInstructions.length - 1) {
//       const nextInstruction = navigationInstructions[currentStep + 1];
//       Speech.speak(nextInstruction.instruction);
//       setCurrentStep(currentStep + 1);
//     }

//     // Arrived at destination
//     if (currentStep === navigationInstructions.length - 1 && distance < 50) {
//       Speech.speak("You have arrived at your destination");
//       setIsNavigating(false);
//       if (navigationCheckIntervalRef.current) {
//         clearInterval(navigationCheckIntervalRef.current);
//       }
//     }
//   };

//   // NEW: Get maneuver instruction
//   const getManeuverInstruction = (maneuver) => {
//     const types = {
//       'turn': 'Turn',
//       'new name': 'Continue',
//       'depart': 'Depart',
//       'arrive': 'Arrive',
//       'merge': 'Merge',
//       'ramp': 'Take ramp',
//       'on ramp': 'Take on ramp',
//       'off ramp': 'Take exit',
//       'fork': 'Take fork',
//       'end of road': 'End of road',
//       'continue': 'Continue',
//       'roundabout': 'Enter roundabout',
//       'rotary': 'Enter rotary',
//       'roundabout turn': 'At roundabout, take exit',
//       'exit roundabout': 'Exit roundabout',
//     };
    
//     const modifiers = {
//       'left': 'left',
//       'right': 'right',
//       'slight left': 'slight left',
//       'slight right': 'slight right',
//       'sharp left': 'sharp left',
//       'sharp right': 'sharp right',
//       'straight': 'straight',
//       'uturn': 'make a U-turn',
//     };
    
//     const type = types[maneuver.type] || maneuver.type;
//     const modifier = modifiers[maneuver.modifier] || '';
    
//     return `${type} ${modifier}`.trim();
//   };

//   // NEW: Format distance
//   const formatDistance = (meters) => {
//     if (meters < 1000) return `${Math.round(meters)} m`;
//     return `${(meters / 1000).toFixed(1)} km`;
//   };

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371000; 
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//       Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distance = R * c;
//     return distance;
//   };

//   const isWithinArrivalDistance = () => {
//     if (!currentLocation || !destinationCoords) {
//       console.log("❌ Missing location data");
//       return false;
//     }

//     const distance = calculateDistance(
//       currentLocation.lat,
//       currentLocation.lng,
//       destinationCoords.lat,
//       destinationCoords.lng
//     );
    
//     const isWithinRange = distance <= 200;
    
//     if (!isWithinRange) {
//       Alert.alert(
//         "Too Far From Destination",
//         `You need to be within 200 meters of the destination to mark as arrived. \n\nCurrent distance: ${distance.toFixed(0)} meters away.`,
//         [{ text: "OK" }]
//       );
//     }
    
//     return isWithinRange;
//   };

//   const getCurrentLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.BestForNavigation,
//       });
      
//       const newLocation = {
//         lat: location.coords.latitude,
//         lng: location.coords.longitude,
//         accuracy: location.coords.accuracy,
//         timestamp: new Date().toISOString()
//       };
      
//       setCurrentLocation(newLocation);
//       setTankerLocations(prev => {
//         const updated = [...prev, newLocation];
//         return updated.length > 100 ? updated.slice(-100) : updated;
//       });
      
//       return newLocation;
//     } catch (error) {
//       console.error("❌ Error getting current location:", error);
//       return null;
//     }
//   };

//   const getTrackingLocation = async () => {
//     try {
//       console.log("📍 Getting tracking location...");
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.BestForNavigation,
//       });
      
//       const newLocation = {
//         lat: location.coords.latitude,
//         lng: location.coords.longitude,
//         accuracy: location.coords.accuracy,
//         timestamp: new Date().toISOString()
//       };
      
//       console.log("📍 Sending location to server");
//       sendLocation({
//         orderId: Ids.orderId, 
//         userId: Ids.userId, 
//         lat: newLocation.lat,
//         lng: newLocation.lng
//       });
      
//       setCurrentLocation(newLocation);
//       setTankerLocations(prev => {
//         const updated = [...prev, newLocation];
//         return updated.length > 100 ? updated.slice(-100) : updated;
//       });
      
//       return newLocation;
//     } catch (error) {
//       console.error("❌ Error getting tracking location:", error);
//       return null;
//     }
//   };

//   const startLocationTracking = () => {
//     console.log("🚛 Starting location tracking...");
//     setIsTracking(true);
    
//     if (locationIntervalRef.current) {
//       clearInterval(locationIntervalRef.current);
//       locationIntervalRef.current = null;
//     }
    
//     getTrackingLocation();
    
//     locationIntervalRef.current = setInterval(async () => {
//       await getTrackingLocation();
//     }, 5000);
//   };

//   const geocodeDestination = async (address) => {
//     try {
//       const results = await Location.geocodeAsync(address);
      
//       if (results && results.length > 0) {
//         const { latitude, longitude } = results[0];
//         setDestinationCoords({
//           lat: latitude,
//           lng: longitude
//         });
//         // Auto-calculate route when destination is set
//         setTimeout(() => {
//           calculateRoute();
//         }, 1000);
//       } else {
//         useFallbackCoordinates();
//       }
//     } catch (error) {
//       console.log("❌ Geocoding failed, but we're handling it:", error.message);
//       useFallbackCoordinates();
//     }
//   };
  
//   const useFallbackCoordinates = () => {
//     console.log("🔄 Using fallback coordinates");
//     setDestinationCoords({
//       lat: 33.6844, 
//       lng: 73.0479
//     });
//   };

//   const handleCall = () => {
//     const phone = orderDetails?.user?.phone || "+923001234567";
//     Linking.openURL(`tel:${phone}`);
//   };

//   const handleNavigate = () => {
//     const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
//       orderDetails.dropLocation || "Delivery Location"
//     )}`;
//     Linking.openURL(url);
//   };

//   const handleUpdateStatus = async (status) => {
//     if (!user) {
//       Alert.alert("Error", "User not found. Please login again.");
//       return;
//     }
    
//     if (!user.Tanker._id) {
//       Alert.alert("Error", "Tanker ID not found in user profile.");
//       return;
//     }
    
//     if (!orderDetails?._id) {
//       Alert.alert("Error", "Order ID not found.");
//       return;
//     }

//     try {
//       const data = await acceptOrder(orderDetails._id, status, user.Tanker._id);
//       if (data) {
//         setRideStatus(status);
//       }
//     } catch (error) {
//       console.log("Error in acceptOrder:", error);
//     }
//   };

//   const handleStartFilling = () => { 
//     handleUpdateStatus("Filling"); 
//     setRideStatus("Filling");
//   };

//   const handleStartRide = () => {
//     try {
//       console.log("IDs", Ids.tankerId, Ids.supplierId);
//       registerTanker(Ids.tankerId, Ids.supplierId);
//       handleUpdateStatus("Enroute");
//       setRideStatus("Enroute");
//       startLocationTracking();
//       startTurnByTurnNavigation(); // Start navigation when ride starts
//     } catch (error) {
//       console.error("Error starting ride:", error);
//     }
//   };

//   const handleArived = () => {
//     if (!isWithinArrivalDistance()) {
//       return;
//     }

//     handleUpdateStatus("Arrived");
//     setRideStatus("Arrived");
//     Speech.speak("Arrived at destination");
//   };

//   const stopLocationTracking = () => {
//     console.log("🛑 Stopping location tracking...");
//     setIsTracking(false);
    
//     if (Ids.orderId && Ids.userId) {
//       console.log("📡 Sending tracking stopped event");
//       sendTrackingStopped(Ids.orderId, Ids.userId);
//     }
    
//     if (locationIntervalRef.current) {
//       clearInterval(locationIntervalRef.current);
//       locationIntervalRef.current = null;
//     }
    
//     // Also stop navigation
//     setIsNavigating(false);
//     if (navigationCheckIntervalRef.current) {
//       clearInterval(navigationCheckIntervalRef.current);
//     }
//   };

//   const handleCompleteRide = async () => {
//     try {
//       console.log("🏁 Completing ride, stopping tracking...");
      
//       stopLocationTracking();
      
//       await handleUpdateStatus("Completed");
//       setRideStatus("Completed");
      
//       await updateTankerStatus("Online", null);
//       await AsyncStorage.multiRemove(['tankerStatus', 'currentOrder']);
      
//       console.log("✅ Ride completed, status reset to Online");
//       router.replace("tabTanker/homeScreen");
//     } catch (error) {
//       console.error("❌ Error completing ride:", error);
//       Alert.alert("Error", "Failed to complete ride. Please try again.");
//     }
//   };

//   // NEW: Repeat current instruction
//   const repeatInstruction = () => {
//     if (navigationInstructions[currentStep]) {
//       Speech.speak(navigationInstructions[currentStep].instruction);
//     }
//   };

//   const renderActionButton = () => {
//     if (rideStatus === "Accepted") {
//       return (
//         <TouchableOpacity style={styles.primaryButton} onPress={handleStartRide}>
//           <Icon name="water-plus" size={24} color="#FFF" />
//           <Text style={styles.primaryButtonText}>Start Ride</Text>
//         </TouchableOpacity>
//       );
//     } else if (rideStatus === "Enroute") {
//       let distanceText = "Arrived";
//       let buttonDisabled = false;
      
//       if (currentLocation && destinationCoords) {
//         const distance = calculateDistance(
//           currentLocation.lat,
//           currentLocation.lng,
//           destinationCoords.lat,
//           destinationCoords.lng
//         );
        
//         if (distance > 200) {
//           distanceText = `Too Far (${distance.toFixed(0)}m)`;
//           buttonDisabled = true;
//         } else {
//           distanceText = `Arrived (${distance.toFixed(0)}m)`;
//         }
//       }

//       return (
//         <TouchableOpacity 
//           style={[
//             styles.primaryButton, 
//             buttonDisabled && styles.disabledButton
//           ]} 
//           onPress={handleArived}
//           disabled={buttonDisabled}
//         >
//           <Icon name="check-circle" size={24} color="#FFF" />
//           <Text style={styles.primaryButtonText}>{distanceText}</Text>
//         </TouchableOpacity>
//       );
//     } else if (rideStatus === "Arrived") {
//       return (
//         <TouchableOpacity style={styles.primaryButton} onPress={handleStartFilling}>
//           <Icon name="check-circle" size={24} color="#FFF" />
//           <Text style={styles.primaryButtonText}>Start Filling</Text>
//         </TouchableOpacity>
//       );
//     } else {
//       return (
//         <TouchableOpacity style={[styles.primaryButton, styles.completedButton]} onPress={handleCompleteRide}>
//           <Icon name="check-circle" size={24} color="#FFF" />
//           <Text style={styles.primaryButtonText}>Complete Delivery</Text>
//         </TouchableOpacity>
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Map Container */}
//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           provider={PROVIDER_DEFAULT}
//           showsUserLocation={true}
//           followsUserLocation={true}
//           showsCompass={true}
//           showsScale={true}
//           loadingEnabled={true}
//         >
//           {/* Route line */}
//           {routeCoords.length > 0 && (
//             <Polyline
//               coordinates={routeCoords}
//               strokeWidth={5}
//               strokeColor="#1e90ff"
//               lineDashPattern={isNavigating ? [0] : [10, 10]}
//             />
//           )}
          
//           {/* Destination marker */}
//           {destinationCoords && (
//             <Marker coordinate={{latitude: destinationCoords.lat, longitude: destinationCoords.lng}}>
//               <View style={styles.destinationMarker}>
//                 <Icon name="map-marker" size={30} color="#FF0000" />
//               </View>
//             </Marker>
//           )}
          
//           {/* Next turn marker */}
//           {navigationInstructions[currentStep] && isNavigating && (
//             <Marker coordinate={navigationInstructions[currentStep].location}>
//               <View style={styles.nextTurnMarker}>
//                 <Icon name="navigation" size={25} color="#28a745" />
//               </View>
//             </Marker>
//           )}
//         </MapView>
        
//         {/* Navigation Controls */}
//         <View style={styles.mapControls}>
//           <TouchableOpacity
//             style={styles.mapControlButton}
//             onPress={handleNavigate}
//           >
//             <Icon name="navigation" size={22} color="#FFF" />
//           </TouchableOpacity>
          
//           {routeCoords.length > 0 && (
//             <TouchableOpacity
//               style={[styles.mapControlButton, styles.routeButton]}
//               onPress={() => setShowNavigationPanel(!showNavigationPanel)}
//             >
//               <Icon name="routes" size={22} color="#FFF" />
//             </TouchableOpacity>
//           )}
          
//           {isNavigating && (
//             <TouchableOpacity
//               style={[styles.mapControlButton, styles.repeatButton]}
//               onPress={repeatInstruction}
//             >
//               <Icon name="replay" size={22} color="#FFF" />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* NEW: Navigation Instructions Panel */}
//       {showNavigationPanel && navigationInstructions.length > 0 && (
//         <View style={styles.navigationPanel}>
//           <View style={styles.navigationHeader}>
//             <Text style={styles.navigationTitle}>
//               {isNavigating ? 'Navigation Active' : 'Route Preview'}
//             </Text>
//             <TouchableOpacity onPress={() => setShowNavigationPanel(false)}>
//               <Icon name="close" size={24} color="#666" />
//             </TouchableOpacity>
//           </View>
          
//           {navigationInstructions[currentStep] && (
//             <View style={styles.currentInstructionCard}>
//               <Text style={styles.currentInstructionText}>
//                 {navigationInstructions[currentStep].instruction}
//               </Text>
//               <Text style={styles.distanceToNextText}>
//                 {formatDistance(distanceToNextTurn)} to go
//               </Text>
//             </View>
//           )}
          
//           <ScrollView style={styles.instructionsList}>
//             {navigationInstructions.map((step, index) => (
//               <View 
//                 key={step.id} 
//                 style={[
//                   styles.instructionItem,
//                   index === currentStep && styles.currentInstructionItem
//                 ]}
//               >
//                 <View style={styles.stepNumberContainer}>
//                   <Text style={styles.stepNumber}>{index + 1}</Text>
//                 </View>
//                 <View style={styles.instructionContent}>
//                   <Text style={[
//                     styles.instructionText,
//                     index === currentStep && styles.currentStepText
//                   ]}>
//                     {step.instruction}
//                   </Text>
//                   <Text style={styles.instructionDistance}>
//                     {formatDistance(step.distance)}
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {/* Order Details Card */}
//       <View style={styles.detailsCard}>
//         <View style={styles.cardHeader}>
//           <View style={styles.customerInfo}>
//             <View style={styles.avatarContainer}>
//               <Icon name="account" size={32} color="#4FC3F7" />
//             </View>
//             <View style={styles.customerTextContainer}>
//               <Text style={styles.customerName}>
//                 {orderDetails?.user?.name || "Customer"}
//               </Text>
//               <Text style={styles.customerLabel}>Customer</Text>
//             </View>
//           </View>
          
//           <TouchableOpacity style={styles.callButton} onPress={handleCall}>
//             <Icon name="phone" size={22} color="#FFF" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.orderDetailsSection}>
//           <View style={styles.detailRow}>
//             <View style={styles.iconWrapper}>
//               <Icon name="map-marker" size={20} color="#4FC3F7" />
//             </View>
//             <Text style={styles.locationText} numberOfLines={2}>
//               {orderDetails?.dropLocation || "No location provided"}
//             </Text>
//           </View>

//           <View style={styles.priceWaterRow}>
//             <View style={styles.priceContainer}>
//               <Text style={styles.priceLabel}>Amount</Text>
//               <Text style={styles.priceValue}>
//                 {orderDetails?.price ? `PKR ${orderDetails.price}` : "PKR --"}
//               </Text>
//             </View>
            
//             <View style={styles.waterContainer}>
//               <Text style={styles.waterLabel}>Capacity</Text>
//               <View style={styles.waterAmountBadge}>
//                 <Icon name="water" size={18} color="#FFF" />
//                 <Text style={styles.waterAmountText}>
//                   {orderDetails?.tankSize || "0"} L
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {orderDetails?.instruction && (
//           <View style={styles.instructionsContainer}>
//             <View style={styles.instructionIconWrapper}>
//               <Icon name="information-outline" size={18} color="#FF9800" />
//             </View>
//             <Text style={styles.instructionsText}>
//               {orderDetails.instruction}
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Bottom Action Button */}
//       <View style={styles.bottomContainer}>
//         {renderActionButton()}
//       </View>
//     </View>
//   );
// }; 

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: "#F5F5F5" 
//   },
//   mapContainer: {
//     height: height * 0.49,
//     position: "relative",
//   },
//   map: {
//     flex: 1,
//   },
//   mapControls: {
//     position: "absolute",
//     bottom: 16,
//     right: 16,
//     flexDirection: "row",
//     gap: 12,
//   },
//   mapControlButton: {
//     backgroundColor: "#4FC3F7",
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   routeButton: {
//     backgroundColor: "#28a745",
//   },
//   repeatButton: {
//     backgroundColor: "#FF9800",
//   },
//   destinationMarker: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nextTurnMarker: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
  
//   // NEW: Navigation Panel Styles
//   navigationPanel: {
//     position: "absolute",
//     top: 60,
//     left: 16,
//     right: 16,
//     backgroundColor: "white",
//     borderRadius: 16,
//     maxHeight: height * 0.35,
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     zIndex: 10,
//   },
//   navigationHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   navigationTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   currentInstructionCard: {
//     backgroundColor: "#e3f2fd",
//     marginHorizontal: 16,
//     marginTop: 8,
//     padding: 16,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: "#2196F3",
//   },
//   currentInstructionText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1565C0",
//     marginBottom: 4,
//   },
//   distanceToNextText: {
//     fontSize: 14,
//     color: "#666",
//   },
//   instructionsList: {
//     maxHeight: height * 0.2,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   instructionItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   currentInstructionItem: {
//     backgroundColor: "#f5f5f5",
//     borderRadius: 8,
//   },
//   stepNumberContainer: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "#4FC3F7",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   stepNumber: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 12,
//   },
//   instructionContent: {
//     flex: 1,
//   },
//   instructionText: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 2,
//   },
//   currentStepText: {
//     fontWeight: "bold",
//     color: "#2196F3",
//   },
//   instructionDistance: {
//     fontSize: 12,
//     color: "#666",
//   },
  
//   // Existing styles (keep as is)
//   detailsCard: {
//     flex: 1,
//     backgroundColor: "#FFF",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.08,
//     shadowRadius: 12,
//     elevation: 8,
//     minHeight: 220,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F0F0F0",
//   },
//   customerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   avatarContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "#E1F5FE",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#4FC3F7",
//   },
//   customerTextContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   customerName: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#212121",
//     marginBottom: 2,
//   },
//   customerLabel: {
//     fontSize: 13,
//     color: "#757575",
//     fontWeight: "500",
//   },
//   callButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "#4FC3F7",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   orderDetailsSection: {
//     gap: 16,
//     marginBottom: 8,
//   },
//   detailRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//   },
//   iconWrapper: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#E1F5FE",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   locationText: {
//     flex: 1,
//     fontSize: 14,
//     color: "#424242",
//     lineHeight: 20,
//     paddingTop: 8,
//   },
//   priceWaterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 16,
//     paddingTop: 8,
//   },
//   priceContainer: {
//     flex: 1,
//     backgroundColor: "#F8F9FA",
//     padding: 14,
//     borderRadius: 12,
//     borderLeftWidth: 3,
//     borderLeftColor: "#4FC3F7",
//   },
//   priceLabel: {
//     fontSize: 12,
//     color: "#757575",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   priceValue: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#212121",
//   },
//   waterContainer: {
//     flex: 1,
//     backgroundColor: "#F8F9FA",
//     padding: 14,
//     borderRadius: 12,
//     borderLeftWidth: 3,
//     borderLeftColor: "#00ACC1",
//   },
//   waterLabel: {
//     fontSize: 12,
//     color: "#757575",
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   waterAmountBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#00ACC1",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     alignSelf: "flex-start",
//   },
//   waterAmountText: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#FFF",
//     marginLeft: 6,
//   },
//   instructionsContainer: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     backgroundColor: "#FFF8E1",
//     padding: 12,
//     borderRadius: 12,
//     marginTop: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: "#FF9800",
//   },
//   instructionIconWrapper: {
//     marginRight: 10,
//     marginTop: 2,
//   },
//   instructionsText: {
//     flex: 1,
//     fontSize: 13,
//     color: "#5D4037",
//     lineHeight: 18,
//   },
//   bottomContainer: {
//     backgroundColor: "#FFF",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#E0E0E0",
//   },
//   primaryButton: {
//     backgroundColor: "#4FC3F7",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     borderRadius: 12,
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   primaryButtonText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#FFF",
//     marginLeft: 12,
//   },
//   completedButton: { 
//     backgroundColor: "#4CAF50",
//   },
//   disabledButton: {
//     backgroundColor: "#CCCCCC",
//   },
// });

// export default DriverRideScreen;