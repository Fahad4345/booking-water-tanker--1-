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
import AssignTankerModal from "../../components/AssignModel";
import { getTankerByCapacity } from "../../api/suppliers/getTankerByCapacity";
import { assignOrderToTanker } from "../../api/suppliers/assignOrder";
import { useUser } from '../../context/context';
import OpenStreetMapView from './../../components/OpenStreetMap';
import OpenMapButton from './../../components/NavigatorIcon';

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
      console.log("Order Details:", parsedOrder);
    } catch (error) {
      console.log("Error parsing order:", error);
    }
  }, [order]);

  const loadTankers = async (tankSize) => {
    setLoading(true);
    try {
      console.log("Order details tankSize:", tankSize);
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
      console.log("Assigning order:", orderDetails._id, "to tanker:", tankerId);
      const response = await assignOrderToTanker(orderDetails._id, tankerId, user._id);

      if (response.success) {
        console.log("Order assigned successfully:", response);

        Alert.alert("✅ Success", "Order assigned successfully!");

      } else {
        Alert.alert("⚠️ Failed", response.message || "Could not assign order.");
      }
    } catch (error) {
      console.error("Error assigning order:", error);
    }
  };

  if (!orderDetails) {
    return (
      <View style={styles.loader}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  const { price, bookingType, dropLocation, deliveryTime, instruction, userId, supplierName } =
    orderDetails;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const makeCall = () => {
    Linking.openURL(`tel:${orderDetails?.user?.phone || "03001234567"}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View pointerEvents="none" style={styles.mapContainer}>
        <OpenStreetMapView
          address={orderDetails.dropLocation}
          readOnly={true}
        />
        {/* <OpenMapButton
          location={orderDetails.dropLocation}
          position={{
            position: "absolute",
            top: height * -0.10,
            right: 16,
          }}
        /> */}

      </View>

      <View style={styles.contentContainer}>
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
              <Text style={styles.infoValue} numberOfLines={1}>
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
                {formatDate(deliveryTime)} • {formatTime(deliveryTime)}
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
              <Text style={styles.infoLabel}>Supplier</Text>
              <Text style={styles.customerName}>{supplierName}</Text>
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

        {/* Action Button */}

      </View>

      <AssignTankerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        order={orderDetails}
        tankers={tankers}
        loading={loading}
        onAssign={handleAssignOrder}
      />
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