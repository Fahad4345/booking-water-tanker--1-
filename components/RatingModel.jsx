import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  type = 'supplier',
  targetName = '',
  bookingId = '',
  existingRating = null,
}) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
 
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (visible) {
     
      if (existingRating && existingRating > 0) {
        setRating(existingRating);
      } else {
        setRating(0);
      }
    } else {
   
      setRating(0);
    }
  }, [visible, existingRating]);
  const handleStarPress = (star) => {
    setRating(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

   

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        
        targetName,
        bookingId,
        type,
        timestamp: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (type === 'supplier') {
      return `Rate ${targetName || 'the Supplier'}`;
    } else {
      return `Rate ${targetName || 'the Customer'}`;
    }
  };

  const getDescription = () => {
    if (type === 'supplier') {
      return 'How was your experience with this water supplier?';
    } else {
      return 'How was your experience with this customer?';
    }
  };

  const getLabels = () => {
    return {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
  };

  const renderStars = () => {
    const stars = [];
    const labels = getLabels();

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          style={styles.starContainer}
          onPress={() => handleStarPress(i)}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={36}
            color={i <= rating ? '#FFD700' : '#CCCCCC'}
          />
          <Text style={styles.starLabel}>{labels[i]}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <Ionicons
                name={type === 'supplier' ? 'water' : 'person'}
                size={24}
                color="#1976D2"
              />
              <Text style={styles.modalTitle}>{getTitle()}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingId}>Booking: #{bookingId}</Text>
            </View>

            <Text style={styles.description}>{getDescription()}</Text>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Rating</Text>
              {renderStars()}
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating}/5 - {getLabels()[rating]}
                </Text>
              )}
            </View>

          
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Submitting...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  bookingInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  ratingSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  starContainer: {
    alignItems: 'center',
    flex: 1,
  },
  starLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 10,
  },

  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  guidelines: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  guidelineText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default RatingModal;