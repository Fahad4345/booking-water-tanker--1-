import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  TouchableOpacity,
  Modal,
  Linking,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import DrawerMenu from "../../components/DrawerMenu";
import { BookTank } from "../../api/bookings/BookTank";
import { useUser } from "../../context/context";
import { GetBookings } from "../../api/bookings/GetBooking";
import OpenStreetMapView from "./../../components/OpenStreetMap";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getSuppliers } from "../../api/suppliers/getAllSupplier";
import { useStripe } from "@stripe/stripe-react-native";
import { useRouter } from "expo-router";
import DatePickerModal from "./../../components/DatePicker";
import { KeyboardAvoidingView, Platform, Dimensions, Keyboard } from "react-native";
const { width, height } = Dimensions.get("window");
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "AIzaSyAaIMtkwwSufhZRRci_Y5qCBKhxipOrYi4";
export default function HomeScreen() {
  const router = useRouter();
  const [selectedTanker, setSelectedTanker] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bookingType, setBookingType] = useState("Immediate");
  const [destination, setDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const { user } = useUser();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const { confirmPayment } = useStripe();
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [suppressNextAutocomplete, setSuppressNextAutocomplete] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const isPlacesAutocompleteEnabled = Boolean(GOOGLE_PLACES_API_KEY);
  const orderSheetAnim = useRef(new Animated.Value(0.5)).current;
  const [orderSheetState, setOrderSheetState] = useState("split");
  const scrollViewRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState(null);
   const[lat, setLat]= useState(null);
   const[lng, setLng]= useState(null);

  const handleScrollBegin = () => {
    if (orderSheetState === "split") {
      console.log("📜 Scroll started - animating to order state");
      animateOrderSheet("order");
    }
  };
  



  const handleScrollEndDrag = (event) => {
   
    if (orderSheetState !== "order") return;
    
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const velocityY = event.nativeEvent.velocity?.y || 0;
    
    console.log(`📜 Scroll end - Y: ${currentScrollY}, Velocity: ${velocityY}`);
    
    
    if (velocityY > 0.3 && currentScrollY <= 60) {
      console.log("🔽 Downward drag at top - animating to split state");
      animateOrderSheet("split");
    }
  };
  const animateOrderSheet = (targetState) => {
    let targetValue = 0.5;
    if (targetState === "map") {
      targetValue = 0;
    } else if (targetState === "order") {
      targetValue = 1;
    }

    setOrderSheetState(targetState);
    Animated.timing(orderSheetAnim, {
      toValue: targetValue,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };
  const toggleOrderSheet = () => {
    animateOrderSheet(orderSheetState === "order" ? "split" : "order");
  };
  const showMapFull = () => animateOrderSheet("map");
  const handleMapDragStart = () => {
    if (orderSheetState !== "map") {
       console.log("drag start");
       Keyboard.dismiss()
      showMapFull();
    }
  };
  const handleMapDragEnd = () => {
    if (orderSheetState == "map") {
      animateOrderSheet("split");
    }
  };

  useEffect(() => {
     console.log("In Home");
    const Getbookings = async () => {
      const UserId = user._id || "";
       console.log("_id",user._id);
      const result = await GetBookings(UserId);
      const defaultCapacity = tankerOptions[0].capacity;
      const supplierList = await getSuppliers(defaultCapacity);
      if (result.success === true) {
        setBookings(result.data);
        setSuppliers(supplierList);
      } else {
        console.log("Failed:", result.message);
      }
    };
    Getbookings();
  }, []);
  const resetForm = () => {
    console.log("🔄 Resetting HomeScreen form...");
    setSelectedTanker(0);
    setBookingType("Immediate");
    setDestination("");
    setSelectedDate("");
    setSelectedTime("");
    setSpecialInstructions("");
    setSelectedSupplier(null);
    setSearchAddress("");
    setPlaceSuggestions([]);
    setIsFetchingPlaces(false);
  
  };

  useFocusEffect(
    React.useCallback(() => {
     
      const checkForReset = async () => {
       
        resetForm();
      };
      
      checkForReset();
    }, [])
  );


useEffect(() => {
  const updateSuppliers = async () => {
    const selectedCapacity = tankerOptions[selectedTanker].capacity;
    const supplierList = await getSuppliers(selectedCapacity);
     console.log(supplierList);
    setSuppliers(supplierList);
    
 
    if (selectedSupplier && !supplierList.some(s => s._id === selectedSupplier._id)) {
      setSelectedSupplier(null);
    }
  };
  
  updateSuppliers();
}, [selectedTanker]);
  useEffect(() => {

  }, [selectedDate]);
  useEffect(() => {
    if (!isPlacesAutocompleteEnabled) {
      return;
    }

    if (suppressNextAutocomplete) {
      setSuppressNextAutocomplete(false);
      setPlaceSuggestions([]);
      setIsFetchingPlaces(false);
      return;
    }

    const trimmedDestination = destination.trim();
    if (trimmedDestination.length < 3) {
      setPlaceSuggestions([]);
      setIsFetchingPlaces(false);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const debounceId = setTimeout(async () => {
      setIsFetchingPlaces(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_PLACES_API_KEY}&input=${encodeURIComponent(
            trimmedDestination
          )}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (!isActive) {
          return;
        }
        if (data.status === "OK") {
          setPlaceSuggestions(data.predictions || []);
        } else {
          console.warn("Google Places Autocomplete:", data.status, data.error_message);
          setPlaceSuggestions([]);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Failed to fetch place suggestions:", error.message);
        }
        if (isActive) {
          setPlaceSuggestions([]);
        }
      } finally {
        if (isActive) {
          setIsFetchingPlaces(false);
        }
      }
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(debounceId);
      controller.abort();
    };
  }, [destination, isPlacesAutocompleteEnabled]);
  const tankerOptions = [
    {
      id: 0,
      name: "6,000",
      capacity: 6000,
      price: "PKR 1,800",
      icon: "🚚",
      color: "#4FC3F7",
    },
    {
      id: 1,
      name: "12,000L",
      capacity: 12000,
      price: "PKR 3,200",
      icon: "🚛",
      color: "#4CAF50",
    },
    {
      id: 2,
      name: "15,000L",
      capacity: 15000,
      price: "PKR 3,800",
      icon: "🚛",
      color: "#2196F3",
    },
    {
      id: 3,
      name: "22,000L",
      capacity: 22000,
      price: "PKR 5,200",
      icon: "🚛",
      color: "#FF9800",
    },
  ];

  const timeSlots = [
    "08:00 - 10:00 AM",
    "10:00 - 12:00 PM",
    "12:00 - 02:00 PM",
    "02:00 - 04:00 PM",
    "04:00 - 06:00 PM",
    "06:00 - 08:00 PM",
  ];
  const validateForm = () => {
     
    if (!selectedSupplier) {
      return false;
    }
  

    if (!destination.trim()) {
      return false;
    }
  
    
    if (bookingType === "Scheduled") {
      if (!selectedDate || !selectedTime) {
        return false;
      }
    }
  
    return true;
  };
  
  const isFormValid = validateForm();
  const shouldShowSuggestions =
    isPlacesAutocompleteEnabled &&
    destination.trim().length >= 3 &&
    (isFetchingPlaces || placeSuggestions.length > 0);
  const sheetTranslateY = orderSheetAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height -80, height * 0.4, 0],
  });
  const handleBooking = async () => {
    if (!selectedSupplier) {
      Alert.alert("Required", "Please select a water supplier");
      return;
    }

    if (!destination) {
      Alert.alert("Required", "Please enter your delivery address");
      return;
    }

    if (bookingType === "Scheduled" && (!selectedDate || !selectedTime)) {
      Alert.alert(
        "Required",
        "Please select date and time for scheduled delivery"
      );
      return;
    }

    
    const selectedTankerData = tankerOptions[selectedTanker];
    let finalPrice = parseInt(
      selectedTankerData.price.replace(/[^\d]/g, ""),
      10
    );

    if (bookingType === "Immediate") {
      finalPrice += 1000;
    }
    console.log("Selected Date", selectedSupplier);
    const BookingDetail = {
      userId: user._id,
      supplierId: selectedSupplier._id,
      supplierName: selectedSupplier.name,
      supplierPhone:selectedSupplier.phone,
      tankSize: selectedTankerData.capacity,
      bookingType,
      dropLocation: destination,
      Latitude:lat,
      Longitude:lng,
      instruction: specialInstructions,
      price: `PKR ${finalPrice.toLocaleString()}`,
      priceNumeric: finalPrice,
      deliveryTime:
        bookingType === "Immediate" ? null : `${selectedDate} ${selectedTime}`,
    };

    router.push({
      pathname: "/tabCustomer/payment",
      params: {
        bookingDetail: JSON.stringify(BookingDetail),
        userEmail: user.email,
      },
    });
  };

  const handleStripePayment = async () => {
    setIsProcessingPayment(true);
  };
  const handleCashPayment = async () => {
    setShowPaymentModal(false);

  
    const result = await BookTank({
      ...pendingBooking,
      paymentMethod: "cash",
    });

    if (result.success === true) {
      Alert.alert("Booking Confirmed! 🎉", "Pay cash upon delivery");

      const updatedBookings = await GetBookings(user._id);
      if (updatedBookings.success) {
        setBookings(updatedBookings.data);
      }
    } else {
      Alert.alert("Error", result.error || "Failed to book tanker");
    }
  };

  const handleRebook = (order) => {
    setDestination(order.dropLocation);
    setSelectedTanker(
      tankerOptions.findIndex((t) => t.capacity == order.tankSize)
    );
    setBookingType(order.bookingType);
    setSelectedSupplier(suppliers.find((s) => s._id === order.supplier));
    setSearchAddress(order.dropLocation);
    setPlaceSuggestions([]);
    setIsFetchingPlaces(false);
  };
  const handleSelectSuggestion = (suggestion) => {
    const description =
      suggestion?.description ||
      suggestion?.structured_formatting?.main_text ||
      "";
    if (!description) {
      return;
    }
    setDestination(description);
    setSearchAddress(description);
    setPlaceSuggestions([]);
    setIsFetchingPlaces(false);
    setSuppressNextAutocomplete(true);
  };

  return (
    <View style={styles.safeContainer}>
     

      <View style={styles.mapWrapper}>
        <OpenStreetMapView
          onLocationSelect={(data) => {
             console.log("Data", data);
            setSelectedLocation(data);
            setDestination(data.address);
            setPlaceSuggestions([]);
            setIsFetchingPlaces(false);
            setSuppressNextAutocomplete(true);
            setLat(data.lat);
            setLng(data.lng);
            
          }}
          onMapDragStart={handleMapDragStart}
          onMapDragEnd={handleMapDragEnd}
          address={searchAddress}
        />
      </View>
      <Animated.View
        style={[
          styles.orderSheet,
          {
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
          <View style={styles.sheetHandleRow}>
            <TouchableOpacity
              style={styles.sheetHandleButton}
              onPress={toggleOrderSheet}
              activeOpacity={0.8}
            >
              <Ionicons
                name={orderSheetState === "order" ? "chevron-down" : "chevron-up"}
                size={20}
                color="#1976D2"
              />
              <Text style={styles.sheetHandleText}>Order Options</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetMapButton}
              onPress={showMapFull}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={18} color="#1976D2" />
              <Text style={styles.sheetMapButtonText}>Map View</Text>
            </TouchableOpacity>
          </View><KeyboardAwareScrollView
  ref={scrollViewRef}
  style={styles.scrollView}
  contentContainerStyle={[
    styles.scrollContent,
   
  ]}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
  enableOnAndroid={true}
  
  extraScrollHeight={0} // No extra scroll
   // Disable automatic behavior
  extraHeight={0}
 
  onScrollBeginDrag={handleScrollBegin}
  onScrollEndDrag={handleScrollEndDrag}
  scrollEventThrottle={40}
>
        
        
        <View style={styles.bookingTypeSection}>
          <View style={styles.bookingTypeRow}>
            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === "Immediate" && styles.bookingTypeActive,
              ]}
              onPress={() => setBookingType("Immediate")}
            >
              <Ionicons
                name="flash"
                size={18}
                color={bookingType === "Immediate" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.bookingTypeText,
                  bookingType === "Immediate" && styles.bookingTypeTextActive,
                ]}
              >
                Immediate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === "Scheduled" && styles.bookingTypeActive,
              ]}
              onPress={() => setBookingType("Scheduled")}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={bookingType === "Scheduled" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.bookingTypeText,
                  bookingType === "Scheduled" && styles.bookingTypeTextActive,
                ]}
              >
                Scheduled
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === "rebook" && styles.bookingTypeActive,
              ]}
              onPress={() => setBookingType("rebook")}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={bookingType === "rebook" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.bookingTypeText,
                  bookingType === "rebook" && styles.bookingTypeTextActive,
                ]}
              >
                Rebook
              </Text>
            </TouchableOpacity>
          </View>
          {bookingType === "Immediate" && (
            <Text style={styles.availabilityNote}>
              ⚡ Subject to availability
            </Text>
          )}
        </View>

        {bookingType === "rebook" && (
          <View style={styles.rebookSection}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {bookings.map((order) => (
              <TouchableOpacity
                key={order._id}
                style={styles.rebookCard}
                onPress={() => handleRebook(order)}
              >
                <View style={styles.rebookIcon}>
                  <Ionicons name="water" size={20} color="#1976D2" />
                </View>
                <View style={styles.rebookInfo}>
                  <Text style={styles.rebookAddress}>{order.dropLocation}</Text>
                  <Text style={styles.rebookDetails}>
                    {order.tankSize} • {order.deliveryTime}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {bookingType !== "rebook" && (
          <>
          

            <View style={styles.tankerSection}>
              <Text style={styles.sectionTitle}>Select Tanker Size</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tankerScroll}
              >
                {tankerOptions.map((tanker, index) => (
                  <TouchableOpacity
                    key={tanker.id}
                    style={[
                      styles.tankerCard,
                      selectedTanker === index && styles.tankerCardActive,
                    ]}
                    onPress={() => setSelectedTanker(index)}
                  >
                    <View
                      style={[
                        styles.tankerIcon,
                        {
                          backgroundColor:
                            selectedTanker === index ? tanker.color : "#f0f0f0",
                        },
                      ]}
                    >
                      <Text style={styles.tankerEmoji}>{tanker.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.tankerCapacity,
                        selectedTanker === index && styles.tankerTextActive,
                      ]}
                    >
                      {tanker.capacity}
                    </Text>
                    <Text
                      style={[
                        styles.tankerPrice,
                        selectedTanker === index && styles.tankerPriceActive,
                      ]}
                    >
                      {tanker.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.supplierSection}>
              <Text style={styles.sectionTitle}>Select Water Supplier</Text>

              <TouchableOpacity
  style={styles.supplierSelectorButton}
  onPress={() => setShowSupplierModal(true)}
>
  {selectedSupplier ? (
    <View style={styles.selectedSupplierContainer}>
      <View
        style={[
          styles.supplierIconSmall,
          { backgroundColor: "#2196F3" },
        ]}
      >
        <Text style={styles.supplierEmojiSmall}>💧</Text>
      </View>
      <View style={styles.selectedSupplierInfo}>
        <Text style={styles.selectedSupplierName}>
          {selectedSupplier.name}
        </Text>
        <View style={styles.supplierMetaRow}>
          <View style={styles.availabilityBadgeSmall}>
            <Ionicons name="checkmark-circle" size={10} color="#4CAF50" />
            <Text style={styles.availabilityTextSmall}>Online</Text>
          </View>
          <Text style={styles.supplierDot}>•</Text>
          <Text style={styles.supplierCapacitySmall}>
            {tankerOptions[selectedTanker].capacity}L Tanker
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-down" size={20} color="#666" />
    </View>
  ) : (
    <View style={styles.placeholderContainer}>
      <Ionicons name="business-outline" size={20} color="#999" />
      <Text style={styles.placeholderText}>
        Tap to select supplier ({tankerOptions[selectedTanker].capacity}L)
      </Text>
      <Ionicons name="chevron-down" size={20} color="#999" />
    </View>
  )}
</TouchableOpacity>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address *</Text>
                <View style={styles.addressInputRow}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Type address or select on map"
                      value={destination}
                      onChangeText={setDestination}
                      placeholderTextColor="#999"
                      onSubmitEditing={() => setSearchAddress(destination)}
                      returnKeyType="search"
                      onFocus={() => {
                        console.log('TextInput focused - keyboard will open');
                        
                      }}
                    />
                    {destination.length > 0 && (
                      <TouchableOpacity onPress={() => setDestination("")}>
                        <Ionicons name="close-circle" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log("Search button pressed for:", destination);
                      setSearchAddress(destination);
                    }}
                    style={styles.searchButton}
                  >
                    <Ionicons name="search" size={22} color="#1976D2" />
                  </TouchableOpacity>
                </View>
                {shouldShowSuggestions && (
                  <View style={styles.suggestionContainer}>
                    {isFetchingPlaces && (
                      <View style={styles.suggestionLoader}>
                        <ActivityIndicator size="small" color="#1976D2" />
                        <Text style={styles.suggestionLoaderText}>
                          Searching nearby addresses...
                        </Text>
                      </View>
                    )}
                    {placeSuggestions.slice(0,3).map((prediction, index) => (
                      <TouchableOpacity
                        key={prediction.place_id || `${prediction.description}-${index}`}
                        style={[
                          styles.suggestionItem,
                          index === placeSuggestions.length - 1 && styles.suggestionItemLast,
                        ]}
                        onPress={() => {handleSelectSuggestion(prediction);Keyboard.dismiss(); animateOrderSheet("split");}}
                      >
                        <Ionicons name="location" size={18} color="#1976D2" />
                        <View style={styles.suggestionTextWrapper}>
                          <Text style={styles.suggestionPrimary}>
                            {prediction?.structured_formatting?.main_text ||
                              prediction?.description}
                          </Text>
                          {prediction?.structured_formatting?.secondary_text && (
                            <Text style={styles.suggestionSecondary}>
                              {prediction?.structured_formatting?.secondary_text}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
           
{bookingType === "Scheduled" && (
  <View style={styles.scheduleRow}>
    
    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
      <Text style={styles.inputLabel}>Date *</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => {
          console.log(" DATE PICKER BUTTON PRESSED - setting showDatePicker to true");
          setShowDatePicker(true);
        }}
      >
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={[styles.input, !selectedDate && { color: "#999" }]}>
          {selectedDate || "Select date"}
        </Text>
      </TouchableOpacity>
    </View>

    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
      <Text style={styles.inputLabel}>Time Slot *</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowTimePicker(true)}
      >
        <Ionicons name="time-outline" size={20} color="#666" />
        <Text
          style={[
            styles.input,
            !selectedTime && { color: "#999" },
          ]}
        >
          {selectedTime || "Select time"}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
)}



               <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
      />

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Special Instructions (Optional)
                </Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#666"
                    style={styles.textAreaIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Gate code, contact person, etc."
                    value={specialInstructions}
                    onChangeText={setSpecialInstructions}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <View style={styles.priceSummary}>
                <Text style={styles.priceLabel}>Price:</Text>
                <Text style={styles.priceValue}>
                  {bookingType === "Immediate"
                    ? `PKR ${(
                        parseInt(
                          tankerOptions[selectedTanker].price.replace(
                            /[^\d]/g,
                            ""
                          ),
                          10
                        ) + 1000
                      ).toLocaleString()}`
                    : tankerOptions[selectedTanker].price}
                </Text>
              </View>
              {bookingType !== "rebook" && (
                <View style={styles.bookingFooter}>
                 <TouchableOpacity
  style={[
    styles.bookButton,
    !isFormValid && styles.bookButtonDisabled
  ]}
  onPress={handleBooking}
  disabled={!isFormValid}
>
  <Text style={styles.bookButtonText}>
    {bookingType === "Immediate"
      ? "Proceed to Payment"
      : "Schedule & Pay"}
  </Text>
  <Ionicons 
    name="arrow-forward" 
    size={20} 
    color={!isFormValid ? "#ccc" : "#fff"} 
  />
</TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
         
          </KeyboardAwareScrollView>
      </Animated.View>
      {/* {orderSheetState === "map" && (
        <TouchableOpacity
          style={styles.orderFab}
          onPress={() => animateOrderSheet("split")}
          activeOpacity={0.9}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.orderFabText}>Order Options</Text>
        </TouchableOpacity>
      )} */}


     
    
      <Modal
  visible={showSupplierModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowSupplierModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>
          Select Water Supplier ({tankerOptions[selectedTanker].capacity}L)
        </Text>
        <TouchableOpacity onPress={() => setShowSupplierModal(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {suppliers.length === 0 ? (
        <View style={styles.noSuppliersContainer}>
          <Ionicons name="warning-outline" size={48} color="#999" />
          <Text style={styles.noSuppliersText}>
            No suppliers available for {tankerOptions[selectedTanker].capacity}L tankers
          </Text>
          <Text style={styles.noSuppliersSubtext}>
            Try selecting a different tanker size
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.supplierList}>
          {suppliers.map((supplier, index) => (
            <TouchableOpacity
              key={supplier._id}
              style={[
                styles.supplierItem,
                selectedSupplier?._id === supplier._id && styles.supplierItemActive,
              ]}
              onPress={() => {
                console.log("Selected Supplier:", supplier);
                setSelectedSupplier(supplier);
                setShowSupplierModal(false);
              }}
            >
              <View
                style={[
                  styles.supplierIconLarge,
                  { backgroundColor: "#2196F3" },
                ]}
              >
                <Text style={styles.supplierEmojiLarge}>💧</Text>
              </View>
              <View style={styles.supplierDetails}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <View style={styles.supplierMeta}>
                  <View style={styles.availabilityBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                    <Text style={styles.availabilityText}>Online</Text>
                  </View>
                  <Text style={styles.supplierDot}>•</Text>
                  <Text style={styles.supplierCapacity}>
                    {tankerOptions[selectedTanker].capacity}L Available
                  </Text>
                </View>
              </View>
              {selectedSupplier?._id === supplier._id && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#1976D2"
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  </View>
</Modal>
 
      <Modal
        visible={showTimePicker}
        transparent
         animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Slot</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeSlotList}>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotItem,
                    selectedTime === slot && styles.timeSlotItemActive,
                  ]}
                  onPress={() => {
                    setSelectedTime(slot);
                    setShowTimePicker(false);
                  }}
                >
                  <Ionicons
                    name="time"
                    size={20}
                    color={selectedTime === slot ? "#1976D2" : "#666"}
                  />
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === slot && styles.timeSlotTextActive,
                    ]}
                  >
                    {slot}
                  </Text>
                  {selectedTime === slot && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#1976D2"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  safeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height:675
  },
  orderSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: height*0.9,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
   
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },
  sheetHandleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sheetHandleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  sheetHandleText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#1976D2",
  },
  sheetMapButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1976D2",
  },
  sheetMapButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#1976D2",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Base padding
  },
 
  bookingTypeSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  bookingTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  bookingTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  bookingTypeActive: {
    backgroundColor: "#1976D2",
  },
  bookingTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  bookingTypeTextActive: {
    color: "#fff",
  },
  availabilityNote: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  rebookSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
    minHeight: 300,
  },
  rebookCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  rebookIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rebookInfo: {
    flex: 1,
  },
  rebookAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  rebookDetails: {
    fontSize: 12,
    color: "#666",
  },
  supplierSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
  },
  supplierSelectorButton: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedSupplierContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  supplierIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  supplierEmojiSmall: {
    fontSize: 22,
  },
  selectedSupplierInfo: {
    flex: 1,
  },
  selectedSupplierName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  supplierMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  supplierRatingSmall: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginLeft: 4,
  },
  supplierDeliveriesSmall: {
    fontSize: 12,
    color: "#999",
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: "#999",
    marginLeft: 12,
  },
  supplierList: {
    padding: 16,
  },
  supplierItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  supplierItemActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1976D2",
  },
  supplierIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  supplierEmojiLarge: {
    fontSize: 28,
  },
  supplierDetails: {
    flex: 1,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  supplierMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  supplierRating: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginLeft: 4,
  },
  supplierDot: {
    fontSize: 13,
    color: "#ccc",
    marginHorizontal: 8,
  },
  supplierDeliveries: {
    fontSize: 13,
    color: "#999",
  },
  tankerSection: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tankerScroll: {
    paddingHorizontal: 16,
  },
  tankerCard: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tankerCardActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1976D2",
  },
  tankerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  tankerEmoji: {
    fontSize: 28,
  },
  tankerCapacity: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  tankerTextActive: {
    color: "#1976D2",
  },
  tankerPrice: {
    fontSize: 11,
    color: "#666",
  },
  tankerPriceActive: {
    color: "#1976D2",
    fontWeight: "600",
  },
  detailsSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingLeft: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    textAlign: 'left',
    textAlignVertical: 'center'
  },
  addressInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
  },
  orderFab: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  orderFabText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  suggestionContainer: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionLoader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionLoaderText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 13,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionTextWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  suggestionPrimary: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  suggestionSecondary: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  scheduleRow: {
    flexDirection: "row",
  },
  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 80,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  priceSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1976D2",
  },
  bookingFooter: {
    marginTop: 14,
    paddingVertical: 12,
  },
  bookButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 600,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  timeSlotList: {
    padding: 16,
  },
  timeSlotItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  timeSlotItemActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1976D2",
  },
  timeSlotText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  timeSlotTextActive: {
    color: "#1976D2",
  },

  paymentContainer: {
    padding: 20,
  },
  orderSummary: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
  },
  paymentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#635BFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cashButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cashIconContainer: {
    backgroundColor: "#E8F5E9",
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  cashButtonTitle: {
    color: "#4CAF50",
  },
  paymentButtonSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  cashButtonSubtitle: {
    color: "#81C784",
  },
  processingText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    fontStyle: "italic",
  },


  noSuppliersContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSuppliersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  noSuppliersSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 4,
  },
  supplierCapacity: {
    fontSize: 13,
    color: '#666',
  },

  availabilityBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  availabilityTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 2,
  },
  supplierCapacitySmall: {
    fontSize: 11,
    color: '#666',
  },
  bookButtonDisabled: {
    backgroundColor: "#cccccc",
    opacity: 0.6,
  },
});




