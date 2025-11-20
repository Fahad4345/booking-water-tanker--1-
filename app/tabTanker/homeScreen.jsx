import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Truck, Clock, CheckCircle, AlertCircle, MapPin, Calendar, XCircle } from 'lucide-react-native';
import { getOrders } from "../../api/tankerProvider/getOrder"
import { useRouter } from 'expo-router';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from 'expo-router';
import { useUser } from '../../context/context';
 import { useUpdateStatus } from '../../components/updateStatus';

export default function TankerDriverOrders({ tankerId = "69008b09a317121a840c02ae" }) {
  const [activeTab, setActiveTab] = useState('Immediate');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
 const{ handleUpdateStatus }=useUpdateStatus();
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const { user, updateTankerStatus } = useUser();
  const router = useRouter();


  const checkUserStatus = () => {
    if (user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') {
      const statusMessage = user?.Tanker.status === 'Pending' 
        ? "Your account is pending approval by admin. Please wait until your account is approved to access all features."
        : "Your account has been blocked. Please contact support for assistance.";
      
     
      return true;
    }
    return false;
  };

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

  const handleTabPress = (tabId) => {
   
    if (checkUserStatus()) {
      return;
    }
    setActiveTab(tabId);
  };

  const handleOrderPress = (order) => {
   
    if (checkUserStatus()) {
      return;
    }
    
    router.replace({
      pathname: '/tabTanker/orderDetail',
      params: { order: JSON.stringify(order) },
    });
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
     
      console.log(user);
 
      if (user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') {
        setOrders([]);
        return;
      }
      
      console.log("id", user.Tanker._id);
      const data = await getOrders(user.Tanker._id);
      setOrders(data || []);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log("Tabtanker");
      fetchOrders();
      
    
      if (user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') {
        setTimeout(() => {
          const statusMessage = user?.Tanker.status === 'Pending' 
            ? "Your account is pending approval by admin. Please wait until your account is approved to access all features."
            : "Your account has been blocked. Please contact support for assistance.";
          
          Alert.alert(
            user?.Tanker.status === 'Pending' ? "Account Pending Approval" : "Account Blocked",
            statusMessage,
            [{ text: "OK", style: "default" }],
            { cancelable: false }
          );
        }, 500);
      }
    }, [user])
  );

  const getFilteredOrders = () => {

    if (user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') {
      return [];
    }
    
    if (activeTab === 'Pending') {
      return orders.filter(order => order.bookingStatus === "Assigned");
    }
    if (activeTab === 'Completed') {
      return orders.filter(order => order.bookingStatus === "Completed");
    }
    return orders.filter(order => order.bookingType === activeTab && order.bookingStatus === "Assigned");
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
      case 'Completed': return '#42a5f5';
      case 'Assigned': return '#42a5f5';
      default: return '#4FC3F7';
    }
  };

  const getRestrictedTitle = () => {
    if (user?.Tanker.status === 'Pending') {
      return "Account Pending Approval";
    } else if (user?.Tanker.status === 'Blocked') {
      return "Account Blocked";
    }
    return "My Orders";
  };

  const getRestrictedMessage = () => {
    if (user?.Tanker.status === 'Pending') {
      return "Your account is currently under review by our admin team. You'll be able to view and accept orders once your account is approved.";
    } else if (user?.Tanker.status === 'Blocked') {
      return "Your account has been temporarily suspended. Please contact our support team to resolve this issue.";
    }
    return "";
  };

  const getBannerColor = () => {
    if (user?.Tanker.status === 'Pending') return '#FFA726';
    if (user?.Tanker.status === 'Blocked') return '#FF6B6B';
    return '#FFA726';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}> 
      <StatusBar style="dark" />

  
      {/* {(user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') && (
        <View style={[styles.restrictedBanner, { backgroundColor: getBannerColor() }]}>
          <AlertCircle size={20} color="#FFF" />
          <Text style={styles.restrictedText}>
            {user?.Tanker.status === 'Pending' ? 'Account Pending Approval - Limited Access' : 'Account Blocked - Restricted Access'}
          </Text>
        </View>
      )} */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getRestrictedTitle()}</Text>
      </View>

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
              onPress={() => handleTabPress(tab.id)}
              disabled={user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked'}
            >
              <Icon size={18} color={isActive ? getStatusColor(tab.id) : '#999'} />
              <Text
                style={[
                  styles.tabText,
                  isActive && { ...styles.activeTabText, color: getStatusColor(tab.id) },
                  (user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') && styles.disabledTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.ordersWrapper}>
        {(user?.Tanker.status === 'Pending' || user?.Tanker.status === 'Blocked') ? (
          <View style={styles.restrictedContainer}>
            <AlertCircle size={60} color={getBannerColor()} />
            <Text style={styles.restrictedTitle}>{getRestrictedTitle()}</Text>
            <Text style={styles.restrictedMessage}>
              {getRestrictedMessage()}
            </Text>
            <Text style={styles.restrictedNote}>
              {user?.Tanker.status === 'Pending' 
                ? "Please check back later or contact support if this takes longer than expected."
                : "Reach out to our support team at support@h2o.com for assistance."
              }
            </Text>
          </View>
        ) : loading ? (
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
                  onPress={() => handleOrderPress(order)} 
                  style={styles.orderCard}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderHeaderLeft}>
                      <View style={[styles.tankIcon, { backgroundColor: getStatusColor(order.bookingStatus) + '20' }]}>
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
                    <Text style={styles.infoText} numberOfLines={2}>{order.dropLocation}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.infoText}>
                      {extractDatePart(order.deliveryTime)} at{" "}
                      {extractTimePart(order.deliveryTime)}
                    </Text>
                  </View>

                  {order.instruction && (
                    <View style={styles.instructionContainer}>
                      <Text style={styles.instructionLabel}>Instructions:</Text>
                      <Text style={styles.instructionText}>{order.instruction}</Text>
                    </View>
                  )}

                  <View style={styles.actionButtons}>
                    {order.bookingStatus === 'Completed' && (
                      <TouchableOpacity style={[styles.actionButton, styles.completedButton]}>
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
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => handleOrderPress(order)}
                      >
                        <Text style={[styles.actionButtonText, styles.viewButtonText]}>View Details</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },

  restrictedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  restrictedText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  restrictedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  restrictedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  restrictedNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
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
    minWidth: 90,
  },
  activeTab: { 
    borderBottomWidth: 3,
  },
  tabText: { 
    fontSize: 13, 
    color: '#999', 
    marginLeft: 6, 
    fontWeight: '600',
    includeFontPadding: false,
  },
  activeTabText: { 
    fontWeight: '700',
  },
  disabledTabText: {
    color: '#CCC',
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
    paddingBottom: 120,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: "#666", 
    fontWeight: "500" 
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
  completedButton: { 
    backgroundColor: '#66BB6A' 
  },
  viewButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  actionButtonText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#FFF' 
  },
  viewButtonText: {
    color: '#4FC3F7',
  },
});