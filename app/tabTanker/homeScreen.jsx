import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ← Import from here
import { StatusBar } from 'expo-status-bar';
import { Truck, Clock, CheckCircle, AlertCircle, MapPin, Calendar } from 'lucide-react-native';
import { getOrders } from "../../api/tankerProvider/getOrder"
import { useRouter } from 'expo-router';
import { acceptOrder } from '../../api/tankerProvider/acceptOrder';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';

export default function TankerDriverOrders({ tankerId = "69008b09a317121a840c02ae" }) {
  const [activeTab, setActiveTab] = useState('Immediate');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const router = useRouter();
  
  const getStoredTankerInfo = async () => {
    try {
      const stored = await AsyncStorage.getItem("tankerInfo");
      if (stored) {
        const tankerInfo = JSON.parse(stored);
        console.log("🚛 Tanker Info:", tankerInfo);
        return tankerInfo;
      }
    } catch (error) {
      console.error("Error fetching tanker info:", error);
    }
    return null;
  };

  const handleUpdateStatus = async (order) => {
    const stored = await getStoredTankerInfo();
    const data = await acceptOrder(order._id, "Accepted", stored.id);

    if (data) {
      router.push({
        pathname: '/acceptedOrderScreen',
        params: { order: JSON.stringify(order) },
      })
    }
  };

  const tabs = [
    { id: 'Immediate', label: 'Immediate', icon: AlertCircle },
    { id: 'Scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'Pending', label: 'Pending', icon: Clock },
    { id: 'Completed', label: 'Completed', icon: CheckCircle },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const stored = await getStoredTankerInfo();
      
      if (!stored?.id) {
        console.error("No tanker ID found");
        setOrders([]);
        return;
      }
      
      const data = await getOrders(stored.id);
      setOrders(data || []);
      console.log("Stored", stored);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const getFilteredOrders = () => {
    if (activeTab === 'Pending') {
      return orders.filter(order => order.bookingStatus === "Assigned");
    }
    if (activeTab === 'Completed') {
      return orders.filter(order => order.bookingStatus === "Completed");
    }
    return orders.filter(order => order.bookingType === activeTab && order.bookingStatus === "Assigned");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Immediate': return '#FF6B6B';
      case 'Scheduled': return '#4FC3F7';
      case 'Pending': return '#FFA726';
      case 'Cancelled': return '#999';
      case 'Active': return '#42a5f5';
      default: return '#4FC3F7';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}> {/* ← Changed from View to SafeAreaView */}
      <StatusBar style="dark" />
      
      {/* Header - Remove platform-specific padding */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && { ...styles.activeTab, borderBottomColor: getStatusColor(tab.id) },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={20} color={isActive ? getStatusColor(tab.id) : '#999'} />
              <Text
                style={[
                  styles.tabText,
                  isActive && { ...styles.activeTabText, color: getStatusColor(tab.id) },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.ordersContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
        ) : getFilteredOrders().length === 0 ? (
          <View style={styles.emptyContainer}>
            <Truck size={60} color="#DDD" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders</Text>
          </View>
        ) : (
          getFilteredOrders().map((order) => (
            <TouchableOpacity key={order._id} onPress={() => {
              router.push({
                pathname: '/orderDetail',
                params: { order: JSON.stringify(order) },
              })
            }} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <View style={[styles.tankIcon, { backgroundColor: getStatusColor(order.bookingStatus) + '20' }]}>
                    <Truck size={24} color={getStatusColor(order.bookingStatus)} />
                  </View>
                  <View>
                    <Text style={styles.tankSize}>{order.tankSize} L</Text>
                    <Text style={styles.orderType}>{order.bookingType}</Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{order.price}</Text>
                </View>
              </View>

              {/* Delivery Info */}
              <View style={styles.infoRow}>
                <MapPin size={16} color="#666" />
                <Text style={styles.infoText}>{order.dropLocation}</Text>
              </View>

              <View style={styles.infoRow}>
                <Clock size={16} color="#666" />
                <Text style={styles.infoText}>
                  {formatDate(order.deliveryTime)} at {formatTime(order.deliveryTime)}
                </Text>
              </View>

              {/* Instructions */}
              {order.instruction && (
                <View style={styles.instructionContainer}>
                  <Text style={styles.instructionLabel}>Instructions:</Text>
                  <Text style={styles.instructionText}>{order.instruction}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {order.bookingStatus === 'Completed' && (
                  <TouchableOpacity style={[styles.actionButton, styles.startButton]}>
                    <Text style={styles.actionButtonText}>Completed</Text>
                  </TouchableOpacity>
                )}
                {order.bookingType === 'Immediate' && order.bookingStatus === 'Assigned' && (
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus(order)}
                    style={[styles.actionButton, styles.acceptButton]}
                  >
                    <Text style={styles.actionButtonText}>Accept Order</Text>
                  </TouchableOpacity>
                )}
                {order.bookingType === 'Scheduled' && order.bookingStatus === 'Assigned' && (
                  <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
                    <Text style={[styles.actionButtonText, styles.viewButtonText]}>View Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 10, // ← Back to normal padding (no platform-specific)
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    marginHorizontal: "auto",
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabsContainer: {
    maxHeight: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  ordersContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tankIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tankSize: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  instructionContainer: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 2,
  },
  instructionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#4FC3F7',
  },
  rejectButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  startButton: {
    backgroundColor: '#66BB6A',
  },
  viewButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  rejectButtonText: {
    color: '#FF6B6B',
  },
  viewButtonText: {
    color: '#4FC3F7',
  },
});