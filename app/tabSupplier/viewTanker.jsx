import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  getSupplierTankers} from '../../api/suppliers/getTankerBySupplier'; 
import { deleteTankerUser } from '../../api/suppliers/deleteTanker'; 
import { useUser } from '../../context/context';

const TankerManagement = () => {
  const [tankers, setTankers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
 const {user}= useUser();

  const fetchTankers = async () => {
    try {
      setLoading(true);
      const result = await getSupplierTankers(user._id);
      
      if (result.success) {
         console.log("Result", result);
        const transformedTankers = result.data.map(tankerUser => ({
          _id: tankerUser._id,
          TankerName: tankerUser.name,
          email: tankerUser.email,
          phone: tankerUser.phone || 'N/A',
          licenseNumber: tankerUser.registrationNumber || 'N/A',
          licenseType: 'PSV', 
          vehicleNumber: tankerUser.registrationNumber || 'N/A',
          manufacturingYear: '2000', 
          capacity: tankerUser.capacity || 0,
          sourceType: tankerUser.sourceType,
          sourceAddress: tankerUser.sourceType, 
          waterQualityCertificate: false, 
          status: tankerUser.status,
          availabilityStatus: tankerUser.availabilityStatus || 'Offline',
          tankerId: tankerUser._id 
        }));
        
        setTankers(transformedTankers);
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch tankers');
      }
    } catch (error) {
      console.error('Error fetching tankers:', error);
      Alert.alert('Error', 'An error occurred while fetching tankers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  
  const onRefresh = () => {
    setRefreshing(true);
    fetchTankers();
  };


  const handleDelete = async (id) => {
    try {
       console.log("Id",id)
      const result = await deleteTankerUser(id);
      
      if (result.success) {
        
        setTankers(tankers.filter((tanker) => tanker._id !== id));
        Alert.alert('Success', 'Tanker deleted successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to delete tanker');
      }
    } catch (error) {
      console.error('Error deleting tanker:', error);
      Alert.alert('Error', 'An error occurred while deleting tanker');
    } finally {
      setDeleteModal(null);
    }
  };

  useEffect(() => {
    fetchTankers();
  }, []);

  const renderTankerCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.tankerName}>{item.TankerName}</Text>
          <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            item.availabilityStatus === 'Online'
              ? styles.statusOnline
              : item.availabilityStatus === 'OnRide'
              ? styles.statusOnRide
              : styles.statusOffline,
          ]}>
          <Text style={styles.statusText}>{item.availabilityStatus}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Capacity:</Text>
          <Text style={styles.value}>{item.capacity.toLocaleString()} L</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.value,
            item.status === 'Approved' ? styles.textSuccess : styles.textDanger
          ]}>
            {item.status}
          </Text>
        </View>
       
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setDeleteModal(item)}>
        <Text style={styles.deleteButtonText}>Delete Tanker</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredTankers =
    selectedTab === 'all'
      ? tankers
      : tankers.filter((t) => t.availabilityStatus === selectedTab);


  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container,]} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Tankers</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Loading tankers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container,]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
 
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tankers</Text>
        
      </View>

     
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'all' && styles.activeTabText,
            ]}>
            All ({tankers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Online' && styles.activeTab]}
          onPress={() => setSelectedTab('Online')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Online' && styles.activeTabText,
            ]}>
            Online ({tankers.filter(t => t.availabilityStatus === 'Online').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'OnRide' && styles.activeTab]}
          onPress={() => setSelectedTab('OnRide')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'OnRide' && styles.activeTabText,
            ]}>
            On Ride ({tankers.filter(t => t.availabilityStatus === 'OnRide').length})
          </Text>
        </TouchableOpacity>
      </View>

    
      {filteredTankers.length > 0 ? (
        <FlatList
          data={filteredTankers}
          renderItem={renderTankerCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00BCD4']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚚</Text>
          <Text style={styles.emptyText}>No tankers found</Text>
          <Text style={styles.emptySubtext}>
            {selectedTab !== 'all' 
              ? `No ${selectedTab.toLowerCase()} tankers available` 
              : 'No tankers registered yet'
            }
          </Text>
          <TouchableOpacity onPress={fetchTankers} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

 
      <Modal
        visible={deleteModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Tanker</Text>
            <Text style={styles.modalText}>
              
              Are you sure you want to delete{' '}
              <Text style={styles.modalBold}>{deleteModal?.TankerName}</Text>?
              This will also delete the associated tanker vehicle and cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModal(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleDelete(deleteModal._id)}>
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F1F1F',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00BCD4',
    borderRadius: 6,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4FC3F7',
  },
  tabText: {
    fontSize: 14,
    color: '#4FC3F7',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00BCD4',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  tankerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F1F1F',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 14,
    color: '#757575',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusOnline: {
    backgroundColor: '#E8F5E9',
  },
  statusOnRide: {
    backgroundColor: '#FFF3E0',
  },
  statusOffline: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#1F1F1F',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  textSuccess: {
    color: '#4CAF50',
  },
  textDanger: {
    color: '#F44336',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 16,
    color: '#BDBDBD',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F1F1F',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBold: {
    fontWeight: '600',
    color: '#1F1F1F',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TankerManagement;