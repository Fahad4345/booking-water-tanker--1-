import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Truck, Clock, CheckCircle, AlertCircle, MapPin, Calendar, XCircle} from 'lucide-react-native';
import { getOrders } from "../../api/suppliers/getOrder";
import { getTankerByCapacity } from "../../api/suppliers/getTankerByCapacity";
import { useRouter, useFocusEffect } from 'expo-router';
import { acceptOrder } from '../../api/tankerProvider/acceptOrder';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { assignOrderToTanker } from "../../api/suppliers/assignOrder";
import { useUser } from '../../context/context';
import AssignTankerModal from '../../components/AssignModel';
import EventBus from '../../utils/EventBus';
import { socket } from '../../utils/socket';
import { RefreshControl } from "react-native";


export default function SupplierOrders({ tankerId = "69008b09a317121a840c02ae" }) {
  const [activeTab, setActiveTab] = useState('Immediate');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filteredTankers, setFilteredTankers] = useState([]);
  const [fetchingTankers, setFetchingTankers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchOrders();
  setRefreshing(false);
};

  const { user } = useUser();

  const router = useRouter();

  const staticTankers = [
    { id: "1", name: "Tanker A", capacity: "10000" },
    { id: "2", name: "Tanker B", capacity: "15000" },
    { id: "3", name: "Tanker C", capacity: "20000" },
    { id: "4", name: "Tanker D", capacity: "15000" },
  ];

  const handleAssignPress = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setFetchingTankers(true);

    try {
      console.log("Fetching tankers for capacity:", order.tankSize);
      const tankers = await getTankerByCapacity(user._id, order.tankSize);
      console.log("Fetched Tankers:", tankers);
      if (tankers && tankers.length > 0) {
        setFilteredTankers(
          tankers.map((t) => ({
            _id: t._id,
            name: t.fullName || t.vehicleNumber,
            vehicleNumber: t.vehicleNumber || 'N/A',
            capacity: t.capacity.toString(),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching tankers:", error);
      const matchingTankers = staticTankers.filter(
        (tanker) => tanker.capacity === order.tankSize
      );
      setFilteredTankers(matchingTankers);
    } finally {
      setFetchingTankers(false);
    }
  };

  const handleAssignOrder = async (tankerId) => {
    try {
      setShowModal(false);
      const response = await assignOrderToTanker(selectedOrder._id, tankerId, user._id);

      if (response.success) {
        Alert.alert("✅ Success", "Order assigned successfully!");
        fetchOrders();
      } else {
        Alert.alert("⚠️ Failed", response.message || "Could not assign order.");
      }
    } catch (error) {
      console.error("Error assigning order:", error);
    }
  };

  const tabs = [
    { id: 'Immediate', label: 'Immediate', icon: AlertCircle },
    { id: 'Scheduled', label: 'Scheduled', icon: Calendar },
    { id: 'Pending', label: 'Pending', icon: Clock },
    { id: 'Assigned', label: 'Assigned', icon: Truck },
    { id: 'Cancelled', label: 'Cancelled', icon: XCircle },
    { id: 'Completed', label: 'Completed', icon: CheckCircle },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Fetching orders for user:", user._id);
      const data = await getOrders(user._id);
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    socket.on("newOrder", (order) => {
      console.log("📩 New Order received in real-time:", order);
      fetchOrders();
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  const getFilteredOrders = () => {
    if (!Array.isArray(orders)) return [];
  
    switch (activeTab) {
      case 'Immediate':
        return orders.filter(
          o =>
            o.bookingType === "Immediate" &&
            !["Assigned", "Cancelled", "Completed"].includes(o.bookingStatus)
        );
  
      case 'Scheduled':
        return orders.filter(
          o =>
            o.bookingType === "Scheduled" &&
            !["Assigned", "Cancelled", "Completed"].includes(o.bookingStatus)
        );
  
      case 'Pending':
        return orders.filter(o => o.bookingStatus === "Pending");
  
      case 'Assigned':
        return orders.filter(o => o.bookingStatus === "Assigned");
  
      case 'Cancelled':
        return orders.filter(o => o.bookingStatus === "Cancelled");
  
      case 'Completed':
        return orders.filter(o => o.bookingStatus === "Completed");
  
      default:
        return orders;
    }
  };
  

  const extractDatePart = (deliveryTime) => {
    if (!deliveryTime) return "Not scheduled";
    return deliveryTime.split(' ').slice(0, 3).join(' ');
  };

  const extractTimePart = (deliveryTime) => {
    if (!deliveryTime) return "";
    return deliveryTime.split(' ').slice(3).join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Immediate': return '#FF6B6B';
      case 'Scheduled': return '#4FC3F7';
      case 'Pending': return '#FFA726';
      case 'Cancelled': return '#999';
      case 'Active': return '#42a5f5';
      case 'Assigned': return '#42a5f5';
      default: return '#4FC3F7';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

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
              style={[styles.tab, isActive && { ...styles.activeTab, borderBottomColor: getStatusColor(tab.id) }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={18} color={isActive ? getStatusColor(tab.id) : '#999'} />
              <Text style={[styles.tabText, isActive && { ...styles.activeTabText, color: getStatusColor(tab.id) }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Orders List */}
     {/* Orders List */}
<View style={styles.ordersWrapper}>
  {loading ? (
    // 🔹 Centered Loader
    <View style={styles.loadingCenter}>
      <ActivityIndicator size="large" color="#4FC3F7" />
      <Text style={styles.loadingText}>Loading orders...</Text>
    </View>
  ) : (
    <ScrollView
      style={styles.ordersContainer}
      contentContainerStyle={styles.ordersContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4FC3F7"]}
          tintColor="#4FC3F7"
          title="Refreshing..."
          titleColor="#4FC3F7"
        />
      }
    >
      {getFilteredOrders().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Truck size={60} color="#DDD" />
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders</Text>
        </View>
      ) : (
        getFilteredOrders().map((order) => (
          <TouchableOpacity
            key={order._id}
            onPress={() =>
              router.push({
                pathname: "/tabSupplier/orderDetail",
                params: { order: JSON.stringify(order) },
              })
            }
            style={styles.orderCard}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <View
                  style={[
                    styles.tankIcon,
                    { backgroundColor: getStatusColor(order.bookingStatus) + "20" },
                  ]}
                >
                  <Truck size={22} color={getStatusColor(order.bookingStatus)} />
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

            <View style={styles.infoRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.infoText} numberOfLines={2}>
                {order.dropLocation}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Clock size={16} color="#666" />
              <Text style={styles.infoText}>
                {extractDatePart(order.deliveryTime)} at{" "}
                {extractTimePart(order.deliveryTime)}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              {(order.bookingType === "Immediate" ||
                order.bookingType === "Scheduled") && (
                  <TouchableOpacity
                  disabled={
                    ["Assigned", "Cancelled", "Completed"].includes(order.bookingStatus)
                  }
                  onPress={() => handleAssignPress(order)}
                  style={[
                    styles.actionButton,
                    styles.acceptButton,
                    ["Assigned", "Cancelled", "Completed"].includes(order.bookingStatus) && {
                      backgroundColor: "#ccc",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      ["Assigned", "Cancelled", "Completed"].includes(order.bookingStatus) && {
                        color: "#666",
                      },
                    ]}
                  >
                    {order.bookingStatus === "Assigned"
                      ? "Assigned"
                      : order.bookingStatus === "Cancelled"
                      ? "Cancelled"
                      : order.bookingStatus === "Completed"
                      ? "Completed"
                      : "Assign Order"}
                  </Text>
                </TouchableOpacity>
                
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )}
</View>


      <AssignTankerModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setFilteredTankers([]);
        }}
        order={selectedOrder}
        tankers={filteredTankers}
        loading={fetchingTankers}
        onAssign={handleAssignOrder}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  tabsContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    maxHeight: 52,
  },
  tabsContent: { 
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minWidth: 90, // Ensure minimum width for all tabs
  },
  activeTab: { 
    borderBottomWidth: 3,
  },
  tabText: { 
    fontSize: 13, 
    color: '#999', 
    marginLeft: 6, 
    fontWeight: '600',
    includeFontPadding: false, // Prevent extra padding
  },
  activeTabText: { 
    fontWeight: '700',
  },
  ordersWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  ordersContainer: {
    flex: 1,
  },
  ordersContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 120, // Extra padding to prevent cutoff
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
 
  emptyContainer: { 
    flex: 1,
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 80 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#999', 
    marginTop: 16 
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  orderHeaderLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  tankIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 
  },
  tankSize: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  orderType: { 
    fontSize: 13, 
    color: '#666', 
    marginTop: 4,
    fontWeight: '500'
  },
  priceContainer: { 
    backgroundColor: '#F8F9FA', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  price: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  infoText: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: { 
    flexDirection: 'row', 
    marginTop: 16 
  },
  actionButton: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  acceptButton: { 
    backgroundColor: '#4FC3F7' 
  },
  actionButtonText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#FFF' 
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666", fontWeight: "500" },
  
});