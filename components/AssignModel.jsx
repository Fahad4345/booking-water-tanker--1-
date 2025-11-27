import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

const AssignTankerModal = ({
    visible,
    onClose,
    order,
    tankers,
    loading,
    onAssign,
}) => {


    if (!order) {
        return (
          <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text>No order data available</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );
      }
    return (

        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            {console.log("Order Details on assign model:", tankers)}
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>
                        Select a Tanker for {order?.tankSize}L Order
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />
                    ) : tankers.length === 0 ? (
                        <Text style={styles.noTankerText}>
                            No tanker found with capacity {order?.tankSize} L
                        </Text>
                    ) : (
                        <ScrollView style={{ maxHeight: 400 }}>
                            {tankers.map((tanker, index) => (
                                <View key={index} style={styles.tankerCard}>
                                    <View style={styles.tankerInfo}>
                                        <Text style={styles.tankerName}>{tanker.name}</Text>
                                        <Text style={styles.tankerVehicle}>{tanker.vehicleNumber}</Text>
                                        <Text style={styles.tankerCapacity}>{tanker.capacity} L</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.assignButton}
                                        onPress={() => onAssign(tanker._id)}
                                    >
                                        <Text style={styles.assignButtonText}>Assign</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default AssignTankerModal;

const styles = StyleSheet.create({
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
});
