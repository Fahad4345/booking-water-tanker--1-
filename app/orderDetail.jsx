import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const OrderDetailScreen = () => {
  const router = useRouter();
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    try {
      const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
      setOrderDetails(parsedOrder);
      console.log("Order Details:", parsedOrder);
    } catch (error) {
      console.log("Error parsing order:", error);
    }
  }, [order]);

  if (!orderDetails) {
    return (
      <View style={styles.loader}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  const {
    price,
    bookingType,
    dropLocation,
    deliveryTime,
    instruction,
    user,
  } = orderDetails;

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
    // you can plug in the real phone later
    Linking.openURL(`tel:${orderDetails?.user?.phone || "03001234567"}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <TouchableOpacity style={styles.mapContainer} activeOpacity={0.8}>
          <View style={styles.navigationButton}>
            <Icon name="navigation" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>

        {/* Order Info Card */}
        <View style={styles.contentContainer}>
          <View style={styles.orderCard}>
            {/* Price */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>{price}</Text>
              </View>
            </View>

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>🚚</Text>
                <Text style={styles.statusText}>{bookingType}</Text>
              </View>
            </View>

            {/* Delivery Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Location</Text>
              <View style={styles.detailRow}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📍</Text>
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailAddress}>{dropLocation}</Text>
                </View>
              </View>
            </View>

            {/* Scheduled Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scheduled Time</Text>
              <View style={styles.detailRow}>
                <View style={[styles.iconCircle, { backgroundColor: "#4FC3F7" }]}>
                  <Text style={styles.iconEmoji}>🕐</Text>
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailValue}>
                    {formatDate(deliveryTime)} at {formatTime(deliveryTime)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Instructions */}
            {instruction && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Instructions</Text>
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsIcon}>📝</Text>
                  <Text style={styles.instructionsText}>{instruction}</Text>
                </View>
              </View>
            )}

            {/* Customer Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.detailRow}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#4FC3F7" }]}
                >
                  <Text style={styles.iconEmoji}>👤</Text>
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailValue}>{user?.name}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { marginTop: 12 }]}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#4FC3F7" }]}
                >
                  <Text style={styles.iconEmoji}>📞</Text>
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailValue}>
                    {user?.phone || "03001234567"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.callButton} onPress={makeCall}>
                  <Text style={styles.callButtonText}>📞</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() =>
              router.push({
                pathname: "/supplier/acceptedOrderScreen",
                params: { order: JSON.stringify(orderDetails) },
              })
            }
          >
            <Text style={styles.acceptButtonText}>Accept Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  mapContainer: {
    height: 250,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
  },
  mapMarker: {
    marginBottom: 12,
  },
  mapMarkerIcon: {
    fontSize: 48,
  },
  mapLocationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  mapTapText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  navigationButton: {
    position: 'absolute',
    top: 180,
    right: 16,
    backgroundColor: '#4FC3F7',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  navigationIcon: {
    fontSize: 24,
  },
  contentContainer: {
    padding: 16,
    
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
 
  amountContainer: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
     maxWidth:100
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  section:{
    marginTop:10

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4FC3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  detailAddress: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  instructionsIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  instructionsText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  callButton: {
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 20,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: '#4FC3F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default OrderDetailScreen;