import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const DriverRideScreen = () => {
  const [rideStatus, setRideStatus] = useState('accepted'); // accepted, filling, in_transit, completed
  const { order } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    try {
      const parsedOrder = typeof order === 'string' ? JSON.parse(order) : order;
      setOrderDetails(parsedOrder);
      console.log("Order Details:", parsedOrder);
    } catch (error) {
      console.log("Error parsing order:", error);
    }
  }, [order]);

  if (!orderDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    const phone = orderDetails?.user?.phone || '+923001234567';
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderDetails.dropLocation || 'Delivery Location')}`;
    Linking.openURL(url);
  };

  const handleStartFilling = () => setRideStatus('filling');
  const handleStartRide = () => setRideStatus('in_transit');
  const handleCompleteRide = () => setRideStatus('completed');

  const renderActionButton = () => {
    if (rideStatus === 'accepted') {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartFilling}>
          <Icon name="water-plus" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Start Filling Water</Text>
        </TouchableOpacity>
      );
    } else if (rideStatus === 'filling') {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartRide}>
          <Icon name="truck-fast" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Start Ride</Text>
        </TouchableOpacity>
      );
    } else if (rideStatus === 'in_transit') {
      return (
        <TouchableOpacity style={styles.primaryButton} onPress={handleCompleteRide}>
          <Icon name="check-circle" size={24} color="#FFF" />
          <Text style={styles.primaryButtonText}>Complete Delivery</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={[styles.primaryButton, styles.completedButton]}>
          <Icon name="check-circle" size={24} color="#4CAF50" />
          <Text style={[styles.primaryButtonText, styles.completedText]}>
            Delivery Completed
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Map area placeholder */}
      <TouchableOpacity 
        style={styles.mapContainer}
        activeOpacity={0.8}
        onPress={handleNavigate}
      >
        <View style={styles.navigateFloatingButton}>
          <Icon name="navigation" size={24} color="#FFF" />
        </View>

        <View style={styles.distanceBadge}>
          <Icon name="map-marker-distance" size={16} color="#333" />
          <Text style={styles.distanceText}>4.5 km</Text>
        </View>
      </TouchableOpacity>

      {/* Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.customerRow}>
          <View>
            <View style={styles.avatarContainer}>
              <Icon name="account" size={28} color="#00BCD4" />
            </View>
            <Text style={styles.customerName}>{orderDetails?.user?.name || 'Customer'}</Text>
          </View>

          <View style={styles.customerDetails}>
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={22} color="#666" />
              <Text style={styles.locationText} numberOfLines={2}>
                {orderDetails?.dropLocation || 'No location provided'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop:10, marginLeft:23 }}>
              <Text style={styles.priceValue}>{orderDetails?.price || 'PKR --'}</Text>
              <View style={styles.waterAmountBadge}>
                <Icon name="water" size={20} color="#00BCD4" />
                <Text style={styles.waterAmountText}>{orderDetails?.tankSize || '0'} L</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Icon name="phone" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Special Instructions */}
        {orderDetails?.instruction && (
          <>
            <View style={styles.divider} />
            <View style={styles.instructionsContainer}>
              <Icon name="information" size={20} color="#FF9800" />
              <Text style={styles.instructionsText}>
                {orderDetails.instruction}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.bottomContainer}>{renderActionButton()}</View>
    </SafeAreaView>
  );
};

// same styles — no change
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  mapContainer: {
    height: height * 0.45,
    position: 'relative',
    backgroundColor: '#E8F4F8',
  },
  navigateFloatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#00BCD4',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  distanceBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  distanceText: { fontSize: 14, fontWeight: '600', color: '#333', marginLeft: 6 },
  detailsCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 110,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 250,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 28,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerName: { fontSize: 12, fontWeight: '700', color: '#333', marginTop: 2 },
  locationRow: { flexDirection: 'row', marginTop: 30, alignItems: 'center' },
  locationText: { fontSize: 13, color: '#666', marginLeft: 4, flex: 1 },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#333' },
  waterAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 10,
    maxWidth: 100,
  },
  waterAmountText: { fontSize: 16, fontWeight: '700', color: '#00BCD4', marginLeft: 5 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 20 },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 14,
    borderRadius: 12,
  },
  instructionsText: { flex: 1, fontSize: 14, color: '#333', marginLeft: 10, lineHeight: 20 },
  bottomContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  primaryButton: {
    backgroundColor: '#00BCD4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF', marginLeft: 12 },
  completedButton: { backgroundColor: '#E8F5E9' },
  completedText: { color: '#4CAF50' },
});

export default DriverRideScreen;
