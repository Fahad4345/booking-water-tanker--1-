import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  StatusBar, 
  Alert, 
  TouchableOpacity,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerMenu from '../../components/DrawerMenu'; // Import your DrawerMenu component

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [selectedTanker, setSelectedTanker] = useState(0);
  const [bookingType, setBookingType] = useState('immediate');
  const [pickupLocation, setPickupLocation] = useState('Street 2 (I-8, I 8/1)');
  const [destination, setDestination] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state

  const tankerOptions = [
    { id: 0, name: '6,000L', capacity: '6,000L', price: 'PKR 1,800', icon: '🚚', color: '#4FC3F7' },
    { id: 1, name: '12,000L', capacity: '12,000L', price: 'PKR 3,200', icon: '🚛', color: '#4CAF50' },
    { id: 2, name: '15,000L', capacity: '15,000L', price: 'PKR 3,800', icon: '🚛', color: '#2196F3' },
    { id: 3, name: '22,000L', capacity: '22,000L', price: 'PKR 5,200', icon: '🚛', color: '#FF9800' },
  ];

  const timeSlots = [
    '08:00 - 10:00 AM',
    '10:00 - 12:00 PM',
    '12:00 - 02:00 PM',
    '02:00 - 04:00 PM',
    '04:00 - 06:00 PM',
    '06:00 - 08:00 PM'
  ];

  const pastOrders = [
    { id: 1, address: 'House 23, Street 5, I-8/3', tanker: '12,000L', date: '2 days ago' },
    { id: 2, address: 'Plaza, Main Murree Road', tanker: '6,000L', date: '1 week ago' },
  ];

  const handleBooking = () => {
    if (!destination) {
      Alert.alert('Required', 'Please enter your delivery address');
      return;
    }
    
    if (bookingType === 'scheduled' && (!selectedDate || !selectedTime)) {
      Alert.alert('Required', 'Please select date and time for scheduled delivery');
      return;
    }

    const selected = tankerOptions[selectedTanker];
    const bookingDetails = `${selected.name} Tanker (${selected.price})
Delivery: ${destination}
Type: ${bookingType === 'immediate' ? 'Immediate Booking' : `Scheduled: ${selectedDate} at ${selectedTime}`}
${specialInstructions ? `Notes: ${specialInstructions}` : ''}`;
    
    Alert.alert('Booking Confirmed! 🎉', bookingDetails);
  };

  const handleRebook = (order) => {
    setDestination(order.address);
    setSelectedTanker(tankerOptions.findIndex(t => t.capacity === order.tanker));
    setBookingType('immediate');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsDrawerOpen(true)} // Open drawer
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Water Tanker Booking</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <View style={styles.mapContent}>
            <View style={styles.locationPin}>
              <Ionicons name="location" size={32} color="#fff" />
            </View>
            <View style={styles.locationLabel}>
              <Ionicons name="navigate" size={12} color="#1976D2" />
              <Text style={styles.locationLabelText}>{pickupLocation}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapOverlayButton}>
            <Ionicons name="navigate-circle" size={20} color="#1976D2" />
            <Text style={styles.mapOverlayText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Type Selection */}
        <View style={styles.bookingTypeSection}>
          <View style={styles.bookingTypeRow}>
            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'immediate' && styles.bookingTypeActive
              ]}
              onPress={() => setBookingType('immediate')}
            >
              <Ionicons 
                name="flash" 
                size={18} 
                color={bookingType === 'immediate' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.bookingTypeText,
                bookingType === 'immediate' && styles.bookingTypeTextActive
              ]}>
                Immediate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'scheduled' && styles.bookingTypeActive
              ]}
              onPress={() => setBookingType('scheduled')}
            >
              <Ionicons 
                name="calendar" 
                size={18} 
                color={bookingType === 'scheduled' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.bookingTypeText,
                bookingType === 'scheduled' && styles.bookingTypeTextActive
              ]}>
                Scheduled
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'rebook' && styles.bookingTypeActive
              ]}
              onPress={() => setBookingType('rebook')}
            >
              <Ionicons 
                name="refresh" 
                size={18} 
                color={bookingType === 'rebook' ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.bookingTypeText,
                bookingType === 'rebook' && styles.bookingTypeTextActive
              ]}>
                Rebook
              </Text>
            </TouchableOpacity>
          </View>
          {bookingType === 'immediate' && (
            <Text style={styles.availabilityNote}>⚡ Subject to availability</Text>
          )}
        </View>

        {/* Rebook Section */}
        {bookingType === 'rebook' && (
          <View style={styles.rebookSection}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {pastOrders.map(order => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.rebookCard}
                onPress={() => handleRebook(order)}
              >
                <View style={styles.rebookIcon}>
                  <Ionicons name="water" size={20} color="#1976D2" />
                </View>
                <View style={styles.rebookInfo}>
                  <Text style={styles.rebookAddress}>{order.address}</Text>
                  <Text style={styles.rebookDetails}>{order.tanker} • {order.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tanker Selection */}
        {bookingType !== 'rebook' && (
          <>
            <View style={styles.tankerSection}>
              <Text style={styles.sectionTitle}>Select Tanker Size</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tankerScroll}
              >
                {tankerOptions.map((tanker, index) => (
                  <TouchableOpacity
                    key={tanker.id}
                    style={[
                      styles.tankerCard,
                      selectedTanker === index && styles.tankerCardActive
                    ]}
                    onPress={() => setSelectedTanker(index)}
                  >
                    <View style={[
                      styles.tankerIcon,
                      { backgroundColor: selectedTanker === index ? tanker.color : '#f0f0f0' }
                    ]}>
                      <Text style={styles.tankerEmoji}>{tanker.icon}</Text>
                    </View>
                    <Text style={[
                      styles.tankerCapacity,
                      selectedTanker === index && styles.tankerTextActive
                    ]}>
                      {tanker.capacity}
                    </Text>
                    <Text style={[
                      styles.tankerPrice,
                      selectedTanker === index && styles.tankerPriceActive
                    ]}>
                      {tanker.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Delivery Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              
              {/* Address Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Address *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter delivery address"
                    value={destination}
                    onChangeText={setDestination}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity>
                    <Ionicons name="map" size={20} color="#1976D2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date & Time (for scheduled) */}
              {bookingType === 'scheduled' && (
                <View style={styles.scheduleRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Date *</Text>
                    <TouchableOpacity style={styles.inputContainer}>
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                      <TextInput
                        style={styles.input}
                        placeholder="Select date"
                        value={selectedDate}
                        onChangeText={setSelectedDate}
                        placeholderTextColor="#999"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Time Slot *</Text>
                    <TouchableOpacity 
                      style={styles.inputContainer}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text style={[
                        styles.input,
                        !selectedTime && { color: '#999' }
                      ]}>
                        {selectedTime || 'Select time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Special Instructions */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <Ionicons name="document-text-outline" size={20} color="#666" style={styles.textAreaIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Gate code, contact person, etc."
                    value={specialInstructions}
                    onChangeText={setSpecialInstructions}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Price Summary */}
              <View style={styles.priceSummary}>
                <Text style={styles.priceLabel}>Estimated Price:</Text>
                <Text style={styles.priceValue}>{tankerOptions[selectedTanker].price}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bookingFooter}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>
            {bookingType === 'immediate' ? 'Book Now' : 'Schedule Booking'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Time Slot Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Slot</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeSlotList}>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlotItem,
                    selectedTime === slot && styles.timeSlotItemActive
                  ]}
                  onPress={() => {
                    setSelectedTime(slot);
                    setShowTimePicker(false);
                  }}
                >
                  <Ionicons 
                    name="time" 
                    size={20} 
                    color={selectedTime === slot ? '#1976D2' : '#666'} 
                  />
                  <Text style={[
                    styles.timeSlotText,
                    selectedTime === slot && styles.timeSlotTextActive
                  ]}>
                    {slot}
                  </Text>
                  {selectedTime === slot && (
                    <Ionicons name="checkmark-circle" size={20} color="#1976D2" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Drawer Menu */}
      <DrawerMenu 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentScreen="index"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  // Map Section
  mapContainer: {
    height: 220,
    backgroundColor: '#E3F2FD',
    position: 'relative',
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPin: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  locationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  locationLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  mapOverlayButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mapOverlayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 6,
  },

  // Booking Type
  bookingTypeSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  bookingTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bookingTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  bookingTypeActive: {
    backgroundColor: '#1976D2',
  },
  bookingTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  bookingTypeTextActive: {
    color: '#fff',
  },
  availabilityNote: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },

  // Rebook Section
  rebookSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  rebookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rebookIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rebookInfo: {
    flex: 1,
  },
  rebookAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  rebookDetails: {
    fontSize: 12,
    color: '#666',
  },

  // Tanker Section
  tankerSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  tankerScroll: {
    paddingHorizontal: 16,
  },
  tankerCard: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tankerCardActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  tankerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tankerEmoji: {
    fontSize: 28,
  },
  tankerCapacity: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  tankerTextActive: {
    color: '#1976D2',
  },
  tankerPrice: {
    fontSize: 11,
    color: '#666',
  },
  tankerPriceActive: {
    color: '#1976D2',
    fontWeight: '600',
  },

  // Details Section
  detailsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    minHeight: 80,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2',
  },

  // Booking Footer
  bookingFooter: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  timeSlotList: {
    padding: 16,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeSlotItemActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  timeSlotText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  timeSlotTextActive: {
    color: '#1976D2',
  },
});