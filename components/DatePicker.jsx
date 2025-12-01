import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

  const  DatePickerModal = ({ visible, onClose, onSelectedDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
  
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };
  
  const isSelectedDate = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === new Date(selectedDate).toDateString();
  };
  
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const handleDateSelect = (date) => {
    if (!isPastDate(date)) {
      console.log("date1: ", formatDate(date));
      onSelectedDate(formatDate(date));
      onClose();
    }
  };
  
  const days = getDaysInMonth(currentMonth);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Delivery Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarContainer}>
    
            <View style={styles.monthNavigation}>
              <TouchableOpacity 
                onPress={handlePreviousMonth}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={24} color="#1976D2" />
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity 
                onPress={handleNextMonth}
                style={styles.navButton}
              >
                <Ionicons name="chevron-forward" size={24} color="#1976D2" />
              </TouchableOpacity>
            </View>
            
      
            <View style={styles.weekDaysContainer}>
              {weekDays.map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>
            
       
            <ScrollView style={styles.daysScrollView}>
              <View style={styles.daysContainer}>
                {days.map((date, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      !date && styles.emptyCell,
                      isToday(date) && styles.todayCell,
                      isSelectedDate(date) && styles.selectedCell,
                      isPastDate(date) && styles.pastDateCell,
                    ]}
                    onPress={() => date && handleDateSelect(date)}
                    disabled={!date || isPastDate(date)}
                  >
                    {date && (
                      <>
                        <Text
                          style={[
                            styles.dayText,
                            isToday(date) && styles.todayText,
                            isSelectedDate(date) && styles.selectedText,
                            isPastDate(date) && styles.pastDateText,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                        {isToday(date) && !isSelectedDate(date) && (
                          <View style={styles.todayDot} />
                        )}
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
         
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#1976D2' }]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#1976D2' }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#f5f5f5' }]} />
                <Text style={styles.legendText}>Unavailable</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  calendarContainer: {
    padding: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  daysScrollView: {
    maxHeight: 320,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    marginBottom: 8,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  todayCell: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  selectedCell: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
  },
  pastDateCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  todayText: {
    color: '#1976D2',
    fontWeight: '700',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  pastDateText: {
    color: '#999',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1976D2',
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});



export default DatePickerModal;
