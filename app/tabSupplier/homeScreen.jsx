// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Truck, Clock, CheckCircle, AlertCircle, MapPin, Calendar } from 'lucide-react-native';
// import { getOrders } from "../../api/suppliers/getOrder";
// import { useRouter, useFocusEffect } from 'expo-router';
// import { acceptOrder } from '../../api/tankerProvider/acceptOrder';
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function SupplierOrders({ tankerId = "69008b09a317121a840c02ae" }) {
//   const [activeTab, setActiveTab] = useState('Immediate');
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [filteredTankers, setFilteredTankers] = useState([]);

//   const router = useRouter();

//   // 🧍‍♂️ Static tanker data (for now)
//   const staticTankers = [
//     { id: "1", name: "Tanker A", capacity: "10000" },
//     { id: "2", name: "Tanker B", capacity: "15000" },
//     { id: "3", name: "Tanker C", capacity: "20000" },
//     { id: "4", name: "Tanker D", capacity: "15000" },
//   ];

//   const getStoredTankerInfo = async () => {
//     try {
//       const stored = await AsyncStorage.getItem("tankerInfo");
//       if (stored) {
//         const tankerInfo = JSON.parse(stored);
//         console.log("🚛 Tanker Info:", tankerInfo);
//         return tankerInfo;
//       }
//     } catch (error) {
//       console.error("Error fetching tanker info:", error);
//     }
//     return null;
//   };

//   const handleAssignPress = (order) => {
//     setSelectedOrder(order);
//     // Filter static tankers by order.tankSize
//     const matchingTankers = staticTankers.filter(
//       (tanker) => tanker.capacity === order.tankSize
//     );
//     setFilteredTankers(matchingTankers);
//     setShowModal(true);
//   };

//   const handleAssignOrder = async (tanker) => {
//     try {
//       setShowModal(false);
//       const stored = await getStoredTankerInfo();
//       const data = await acceptOrder(selectedOrder._id, "Accepted", tanker.id);

//       if (data) {
//         router.push({
//           pathname: '/acceptedOrderScreen',
//           params: { order: JSON.stringify(selectedOrder) },
//         });
//       }
//     } catch (error) {
//       console.error("Error assigning order:", error);
//     }
//   };

//   const tabs = [
//     { id: 'Immediate', label: 'Immediate', icon: AlertCircle },
//     { id: 'Scheduled', label: 'Scheduled', icon: Calendar },
//     { id: 'Pending', label: 'Pending', icon: Clock },
//     { id: 'Completed', label: 'Completed', icon: CheckCircle },
//   ];

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const data = await getOrders("6904d7a3d7d66b2f08df41e5");
//       setOrders(data || []);
//       console.log("📦 Orders fetched:", data || 0);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       setOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchOrders();
//     }, [])
//   );

//   const getFilteredOrders = () => {
//     if (!Array.isArray(orders)) return [];
//     if (activeTab === 'Immediate') return orders.filter(o => o.bookingType === "Immediate");
//     if (activeTab === 'Pending') return orders.filter(o => o.bookingStatus === "Pending");
//     if (activeTab === 'Scheduled') return orders.filter(o => o.bookingType === "Scheduled");
//     if (activeTab === 'Completed') return orders.filter(o => o.bookingStatus === "Completed");
//     return orders;
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   };

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Immediate': return '#FF6B6B';
//       case 'Scheduled': return '#4FC3F7';
//       case 'Pending': return '#FFA726';
//       case 'Cancelled': return '#999';
//       case 'Active': return '#42a5f5';
//       default: return '#4FC3F7';
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar style="dark" />

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>My Orders</Text>
//       </View>

//       {/* Tabs */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
//         {tabs.map((tab) => {
//           const Icon = tab.icon;
//           const isActive = activeTab === tab.id;
//           return (
//             <TouchableOpacity
//               key={tab.id}
//               style={[styles.tab, isActive && { ...styles.activeTab, borderBottomColor: getStatusColor(tab.id) }]}
//               onPress={() => setActiveTab(tab.id)}
//             >
//               <Icon size={20} color={isActive ? getStatusColor(tab.id) : '#999'} />
//               <Text style={[styles.tabText, isActive && { ...styles.activeTabText, color: getStatusColor(tab.id) }]}>
//                 {tab.label}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </ScrollView>

//       {/* Orders List */}
//       <ScrollView style={styles.ordersContainer}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />
//         ) : getFilteredOrders().length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Truck size={60} color="#DDD" />
//             <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders</Text>
//           </View>
//         ) : (
//           getFilteredOrders().map((order) => (
//             <TouchableOpacity
//               key={order._id}
//               onPress={() =>
//                 router.push({
//                   pathname: '/orderDetail',
//                   params: { order: JSON.stringify(order) },
//                 })
//               }
//               style={styles.orderCard}
//             >
//               <View style={styles.orderHeader}>
//                 <View style={styles.orderHeaderLeft}>
//                   <View style={[styles.tankIcon, { backgroundColor: getStatusColor(order.bookingStatus) + '20' }]}>
//                     <Truck size={24} color={getStatusColor(order.bookingStatus)} />
//                   </View>
//                   <View>
//                     <Text style={styles.tankSize}>{order.tankSize} L</Text>
//                     <Text style={styles.orderType}>{order.bookingType}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.priceContainer}>
//                   <Text style={styles.price}>{order.price}</Text>
//                 </View>
//               </View>

//               <View style={styles.infoRow}>
//                 <MapPin size={16} color="#666" />
//                 <Text style={styles.infoText}>{order.dropLocation}</Text>
//               </View>

//               <View style={styles.infoRow}>
//                 <Clock size={16} color="#666" />
//                 <Text style={styles.infoText}>
//                   {formatDate(order.deliveryTime)} at {formatTime(order.deliveryTime)}
//                 </Text>
//               </View>

//               {order.instruction && (
//                 <View style={styles.instructionContainer}>
//                   <Text style={styles.instructionLabel}>Instructions:</Text>
//                   <Text style={styles.instructionText}>{order.instruction}</Text>
//                 </View>
//               )}

//               <View style={styles.actionButtons}>
//                 {order.bookingStatus === 'Completed' && (
//                   <TouchableOpacity style={[styles.actionButton, styles.startButton]}>
//                     <Text style={styles.actionButtonText}>Completed</Text>
//                   </TouchableOpacity>
//                 )}
//                 {order.bookingType === 'Immediate' && (
//                   <TouchableOpacity
//                     onPress={() => handleAssignPress(order)}
//                     style={[styles.actionButton, styles.acceptButton]}
//                   >
//                     <Text style={styles.actionButtonText}>Assign Order</Text>
//                   </TouchableOpacity>
//                 )}
//                 {order.bookingType === 'Scheduled' && (
//                   <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
//                     <Text style={[styles.actionButtonText, styles.viewButtonText]}>View Details</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>

//       {/* 🚛 Modal for Tanker Selection */}
//       <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Select a Tanker</Text>

//             {filteredTankers.length === 0 ? (
//               <Text style={styles.noTankerText}>
//                 No tanker found with capacity {selectedOrder?.tankSize} L
//               </Text>
//             ) : (
//               <ScrollView style={{ maxHeight: 300 }}>
//                 {filteredTankers.map((tanker) => (
//                   <TouchableOpacity
//                     key={tanker.id}
//                     style={styles.tankerItem}
//                     onPress={() => handleAssignOrder(tanker)}
//                   >
//                     <Text style={styles.tankerName}>{tanker.name}</Text>
//                     <Text style={styles.tankerCapacity}>{tanker.capacity} L</Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             )}

//             <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
//               <Text style={styles.closeButtonText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }






import React, { useState, useCallback } from 'react';
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
import { Truck, Clock, CheckCircle, AlertCircle, MapPin, Calendar } from 'lucide-react-native';
import { getOrders } from "../../api/suppliers/getOrder";
import { getTankerByCapacity } from "../../api/suppliers/getTankerByCapacity"; // ✅ added
import { useRouter, useFocusEffect } from 'expo-router';
import { acceptOrder } from '../../api/tankerProvider/acceptOrder';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { assignOrderToTanker } from "../../api/suppliers/assignOrder"; // ✅ added
import { useUser } from '../../context/context';



export default function SupplierOrders({ tankerId = "69008b09a317121a840c02ae" }) {
  const [activeTab, setActiveTab] = useState('Immediate');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filteredTankers, setFilteredTankers] = useState([]);
  const [fetchingTankers, setFetchingTankers] = useState(false); // ✅ added
  const { user } = useUser();

  const router = useRouter();

  // ✅ Static fallback tankers
  const staticTankers = [
    { id: "1", name: "Tanker A", capacity: "10000" },
    { id: "2", name: "Tanker B", capacity: "15000" },
    { id: "3", name: "Tanker C", capacity: "20000" },
    { id: "4", name: "Tanker D", capacity: "15000" },
  ];





  // ✅ Modified Assign Press (fetch from API)
  const handleAssignPress = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setFetchingTankers(true);

    try {


      // ✅ Fetch from your backend
      const tankers = await getTankerByCapacity(user._id, order.tankSize);
      console.log("Fetched Tankers:", tankers);
      if (tankers && tankers.length > 0) {
        setFilteredTankers(
          tankers.map((t) => ({
            id: t._id,
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
        fetchOrders(); // refresh list
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
    { id: 'Completed', label: 'Completed', icon: CheckCircle },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders(user._id);
      setOrders(data || []);
      console.log("📦 Orders fetched:", data || 0);
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
    if (!Array.isArray(orders)) return [];

    switch (activeTab) {
      case 'Immediate':
        return orders.filter(o => o.bookingType === "Immediate" &&
          o.bookingStatus !== 'Assigned');
      case 'Pending':
        return orders.filter(o => o.bookingStatus === "Pending" &&
          o.bookingStatus !== 'Assigned');
      case 'Scheduled':
        return orders.filter(o => o.bookingType === "Scheduled" &&
          o.bookingStatus !== 'Assigned');
      case 'Assigned':
        return orders.filter(o => o.bookingStatus === "Assigned"); // ✅ NEW
      case 'Completed':
        return orders.filter(o => o.bookingStatus === "Completed");
      default:
        return orders;
    }
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
      case 'Assigned': return '#42a5f5'; // ✅ blue tone for Assigned

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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && { ...styles.activeTab, borderBottomColor: getStatusColor(tab.id) }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={20} color={isActive ? getStatusColor(tab.id) : '#999'} />
              <Text style={[styles.tabText, isActive && { ...styles.activeTabText, color: getStatusColor(tab.id) }]}>
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
            <TouchableOpacity
              key={order._id}
              onPress={() =>
                router.push({
                  pathname: '/orderDetail',
                  params: { order: JSON.stringify(order) },
                })
              }
              style={styles.orderCard}
            >
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

              <View style={styles.actionButtons}>
                {order.bookingType === 'Immediate' && (
                  <TouchableOpacity
                    disabled={order.bookingStatus === 'Assigned'} // ✅ disable when assigned
                    onPress={() => handleAssignPress(order)}
                    style={[
                      styles.actionButton,
                      styles.acceptButton,
                      order.bookingStatus === 'Assigned' && { backgroundColor: '#ccc' }, // ✅ gray out
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        order.bookingStatus === 'Assigned' && { color: '#666' }, // ✅ dim text
                      ]}
                    >
                      {order.bookingStatus === 'Assigned' ? 'Assigned' : 'Assign Order'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* 🚛 Modal for Tanker Selection */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Select a Tanker for {selectedOrder?.tankSize}L Order
            </Text>

            {fetchingTankers ? (
              <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />
            ) : filteredTankers.length === 0 ? (
              <Text style={styles.noTankerText}>
                No tanker found with capacity {selectedOrder?.tankSize} L
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {filteredTankers.map((tanker) => (
                  <View key={tanker.id} style={styles.tankerCard}>
                    <View style={styles.tankerInfo}>
                      <Text style={styles.tankerName}>{tanker.name}</Text>
                      <Text style={styles.tankerVehicle}>{tanker.vehicleNumber}</Text>
                      <Text style={styles.tankerCapacity}>{tanker.capacity} L</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignOrder(tanker.id)}
                    >
                      <Text style={styles.assignButtonText}>Assign</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowModal(false); setFilteredTankers([]); }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
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
  tabsContent: { paddingHorizontal: 10 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomWidth: 3 },
  tabText: { fontSize: 14, color: '#999', marginLeft: 6, fontWeight: '500' },
  activeTabText: { fontWeight: '700' },
  ordersContainer: { flex: 1, padding: 16 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16 },
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
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  tankIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tankSize: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  orderType: { fontSize: 12, color: '#666', marginTop: 2 },
  priceContainer: { backgroundColor: '#F0F0F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#666', marginLeft: 8 },
  instructionContainer: { backgroundColor: '#F8F8F8', padding: 12, borderRadius: 8, marginTop: 8, marginBottom: 2 },
  instructionLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  instructionText: { fontSize: 14, color: '#333' },
  actionButtons: { flexDirection: 'row', marginTop: 12 },
  actionButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  acceptButton: { backgroundColor: '#4FC3F7' },
  startButton: { backgroundColor: '#66BB6A' },
  viewButton: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#4FC3F7' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  viewButtonText: { color: '#4FC3F7' },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tankerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tankerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  tankerCapacity: {
    fontSize: 13,
    color: '#666',
  },
  noTankerText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    marginTop: 16,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Update/Add these styles to your existing styles object
  tankerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tankerInfo: {
    flex: 1,
  },
  tankerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tankerVehicle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tankerCapacity: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  assignButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});