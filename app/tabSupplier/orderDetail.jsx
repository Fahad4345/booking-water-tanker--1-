// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   Linking,
//   Alert,
//   Platform
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import AssignTankerModal from "../../components/AssignModel";
// import { getTankerByCapacity } from "../../api/suppliers/getTankerByCapacity";
// import { assignOrderToTanker } from "../../api/suppliers/assignOrder";
// import { useUser } from '../../context/context';
// import OpenStreetMapView from './../../components/OpenStreetMap';

// const { width, height } = Dimensions.get("window");

// const OrderDetailScreen = () => {
//   const router = useRouter();
//   const { order } = useLocalSearchParams();
//   const [orderDetails, setOrderDetails] = useState(null);
//   const { user } = useUser();

//   const [showModal, setShowModal] = useState(false);
//   const [tankers, setTankers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     try {
//       const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
//       setOrderDetails(parsedOrder);
//       console.log("Order Details:", parsedOrder);
//     } catch (error) {
//       console.log("Error parsing order:", error);
//     }
//   }, [order]);

//   const loadTankers = async (tankSize) => {
//     setLoading(true);
//     try {
//       console.log("Order details tankSize:", tankSize);
//       const response = await getTankerByCapacity(user._id, tankSize);
//       if (response && response.length > 0) {
//         setTankers(
//           response.map((t) => ({
//             _id: t._id,
//             name: t.fullName || t.vehicleNumber,
//             vehicleNumber: t.vehicleNumber || 'N/A',
//             capacity: t.capacity.toString(),
//           }))
//         );
//       }
//     } catch (err) {
//       console.log("Error loading tankers:", err);
//       setTankers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAssignOrder = async (tankerId) => {
//     try {
//       setShowModal(false);
//       console.log("Assigning order:", orderDetails._id, "to tanker:", tankerId);
//       const response = await assignOrderToTanker(orderDetails._id, tankerId, user._id);

//       if (response.success) {
//         Alert.alert("✅ Success", "Order assigned successfully!");
//         router.replace('/tabSupplier/homeScreen');
//       } else {
//         Alert.alert("⚠️ Failed", response.message || "Could not assign order.");
//       }
//     } catch (error) {
//       console.error("Error assigning order:", error);
//     }
//   };
//   const handleNavigate = (dropLocation) => {
//     console.log("openningurl...")
//     const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
//       dropLocation || "Delivery Location"
//     )}`;
//      console.log("openningurl...")
//     Linking.openURL(url);
//   };


//   if (!orderDetails) {
//     return (
//       <View style={styles.loader}>
//         <Text>Loading order details...</Text>
//       </View>
//     );
//   }

//   const { price, bookingType, dropLocation, deliveryTime, instruction, userId } =
//     orderDetails;


// const extractDatePart = (deliveryTime) => {

//   return deliveryTime.split(' ').slice(0, 3).join(' ');
// };


// const extractTimePart = (deliveryTime) => {

//   return deliveryTime.split(' ').slice(3).join(' ');
// };

//   const makeCall = () => {
//     Linking.openURL(`tel:${orderDetails?.user?.phone || "03001234567"}`);
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />

//       <View style={styles.mapContainer}>
//   {/* MAP — non-interactive */}
//   <View pointerEvents="none" style={styles.mapWrapper}>
//     <OpenStreetMapView
//       address={orderDetails.dropLocation}
//       readOnly={true}
//     />
//   </View>

//   {/* BUTTON — stays clickable */}
//   <TouchableOpacity
//     style={styles.navigationButton}
//     onPress={() => handleNavigate(orderDetails.dropLocation)}
//     activeOpacity={0.7}
//   ><Icon name="navigation" size={20} color="#FFF" />
   
//   </TouchableOpacity>
// </View>

//       <View style={styles.contentContainer}>
//         {/* Price and Type Row */}
//         <View style={styles.topRow}>
//           <View style={styles.compactSection}>
//             <Text style={styles.miniLabel}>Price</Text>
//             <View style={styles.priceTag}>
//               <Text style={styles.priceText}>{price}</Text>
//             </View>
//           </View>
//           <View style={styles.compactSection}>
//             <Text style={styles.miniLabel}>Type</Text>
//             <View style={styles.typeTag}>
//               <Text style={styles.typeIcon}>🚚</Text>
//               <Text style={styles.typeText}>{bookingType}</Text>
//             </View>
//           </View>
//         </View>

//         {/* Location */}
//         <View style={styles.infoRow}>
//           <View style={styles.infoItem}>
//             <View style={styles.miniIconCircle}>
//               <Text style={styles.miniEmoji}>📍</Text>
//             </View>
//             <View style={styles.infoTextBox}>
//               <Text style={styles.infoLabel}>Location</Text>
//               <Text style={styles.infoValue} numberOfLines={1}>
//                 {dropLocation}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Scheduled Time */}
//         <View style={styles.infoRow}>
//           <View style={styles.infoItem}>
//             <View style={styles.miniIconCircle}>
//               <Text style={styles.miniEmoji}>🕐</Text>
//             </View>
//             <View style={styles.infoTextBox}>
//               <Text style={styles.infoLabel}>Scheduled</Text>
//               <Text style={styles.infoValue}>
//               {extractDatePart(orderDetails.deliveryTime)} at {extractTimePart(orderDetails.deliveryTime)}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Instructions */}
//         {instruction && (
//           <View style={styles.instructionsCompact}>
//             <Text style={styles.instructionsIcon}>📝</Text>
//             <Text style={styles.instructionsText} numberOfLines={2}>
//               {instruction}
//             </Text>
//           </View>
//         )}

//         {/* Customer Info */}
//         <View style={styles.customerRow}>
//           <View style={styles.customerInfo}>
//             <View style={styles.miniIconCircle}>
//               <Text style={styles.miniEmoji}>👤</Text>
//             </View>
//             <View style={styles.customerTextBox}>
//               <Text style={styles.infoLabel}>Customer</Text>
//               <Text style={styles.customerName}>{user?.name}</Text>
//             </View>
//           </View>
//           <View style={styles.phoneBox}>
//             <Text style={styles.phoneNumber}>
//               {user?.phone || "03001234567"}
//             </Text>
//             <TouchableOpacity style={styles.callButton} onPress={makeCall}>
//               <Text style={styles.callButtonText}>📞</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Action Button */}
//         <TouchableOpacity
//           style={styles.assignButton}
//           onPress={() => {
//             loadTankers(orderDetails.tankSize);
//             setShowModal(true);
//           }}
//         >
//           <Text style={styles.assignButtonText}>Assign Tanker</Text>
//         </TouchableOpacity>
//       </View>

//       <AssignTankerModal
//         visible={showModal}
//         onClose={() => setShowModal(false)}
//         order={orderDetails}
//         tankers={tankers}
//         loading={loading}
//         onAssign={handleAssignOrder}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F9FAFB",
//   },
//   loader: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   mapContainer: {
//     position: 'relative',
//     height: 320,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   mapWrapper: {
//     flex: 1,
//   },

//   navigationButton: {
//     position: "absolute",
//     top: height * 0.25,
//     right: 16,
//     backgroundColor: "#4FC3F7",
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 6,
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   contentContainer: {
//     flex: 1,
//     padding: 16,
//     paddingTop: 12,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     marginTop: -20,
//     backgroundColor: '#f5f5f5',
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   compactSection: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   miniLabel: {
//     fontSize: 11,
//     color: "#6B7280",
//     marginBottom: 6,
//     fontWeight: "500",
//   },
//   priceTag: {
//     backgroundColor: "#4FC3F7",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     elevation: 3,
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//   },
//   priceText: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "white",
//   },
//   typeTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#4FC3F7",
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//     borderRadius: 10,
//     elevation: 3,
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//   },
//   typeIcon: {
//     fontSize: 14,
//     marginRight: 4,
//   },
//   typeText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "white",
//   },
//   infoRow: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 8,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 3,
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   miniIconCircle: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#4FC3F7",
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 2,
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   miniEmoji: {
//     fontSize: 16,
//   },
//   infoTextBox: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   infoLabel: {
//     fontSize: 11,
//     color: "#6B7280",
//     marginBottom: 2,
//   },
//   infoValue: {
//     fontSize: 13,
//     color: "black",
//     fontWeight: "500",
//   },
//   instructionsCompact: {
//     flexDirection: "row",
//     backgroundColor: "#F3F4F6",
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 8,
//     elevation: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   instructionsIcon: {
//     fontSize: 16,
//     marginRight: 8,
//   },
//   instructionsText: {
//     flex: 1,
//     fontSize: 12,
//     color: "#374151",
//   },
//   customerRow: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 3,
//   },
//   customerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   customerTextBox: {
//     flex: 1,
//     marginLeft: 10,
//   },
//   customerName: {
//     fontSize: 14,
//     color: "#374151",
//     fontWeight: "600",
//   },
//   phoneBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#F9FAFB",
//     padding: 10,
//     borderRadius: 8,
//   },
//   phoneNumber: {
//     fontSize: 13,
//     color: "#4B5563",
//     fontWeight: "500",
//   },
//   callButton: {
//     backgroundColor: "#10B981",
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     elevation: 3,
//     shadowColor: "#10B981",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   callButtonText: {
//     fontSize: 16,
//   },
//   assignButton: {
//     backgroundColor: "#4FC3F7",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     elevation: 4,
//     shadowColor: "#4FC3F7",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   assignButtonText: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#fff",
//   },
// });

// export default OrderDetailScreen;




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

const { width, height } = Dimensions.get("window");

const OrderDetailScreen = () => {
  const router = useRouter();
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const { user } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [tankers, setTankers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
      setOrderDetails(parsedOrder);
       console.log("parsed order", parsedOrder);
    } catch (error) {
      console.log("Error parsing order:", error);
    }
  }, [order]);

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
    Linking.openURL(`tel:${user?.phone || "03001234567"}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Map Section */}
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

      {/* Content Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Price and Type Row */}
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

        {/* Location */}
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

        {/* Scheduled Time */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <View style={styles.miniIconCircle}>
              <Text style={styles.miniEmoji}>🕐</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Scheduled</Text>
              <Text style={styles.infoValue}>
                {extractDatePart(orderDetails.deliveryTime)} at {extractTimePart(orderDetails.deliveryTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        {instruction && (
          <View style={styles.instructionsCompact}>
            <Text style={styles.instructionsIcon}>📝</Text>
            <Text style={styles.instructionsText} numberOfLines={2}>
              {instruction}
            </Text>
          </View>
        )}

        {/* Customer Info */}
        <View style={styles.customerRow}>
          <View style={styles.customerInfo}>
            <View style={styles.miniIconCircle}>
              <Text style={styles.miniEmoji}>👤</Text>
            </View>
            <View style={styles.customerTextBox}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.customerName}>{user?.name}</Text>
            </View>
          </View>
          <View style={styles.phoneBox}>
            <Text style={styles.phoneNumber}>
              {user?.phone || "03001234567"}
            </Text>
            <TouchableOpacity style={styles.callButton} onPress={makeCall}>
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {orderDetails.bookingStatus == "Pending" ? (
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => {
              loadTankers(orderDetails.tankSize);
              setShowModal(true);
            }}
          >
            <Text style={styles.assignButtonText}>Assign Tanker</Text>
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