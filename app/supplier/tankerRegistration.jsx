import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { registerTankerProvider } from "../../api/tankerProvider/register"; 

const TankerProviderRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({

    fullName: '',
    phone: '',
    email: '',
    cnic: '',
    cnicExpiry: '',
    
 
    vehicleNumber: '',
    registrationNumber: '',
    capacity: '6000',
    vehicleModel: '',
    manufacturingYear: '',
    
 
    licenseNumber: '',
    licenseExpiry: '',
    licenseType: 'LTV',
    
   
    waterSource: '',
    sourceAddress: '',
    sourceType: 'municipal',
    waterQualityCertificate: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };


  const handleSubmit = async () => {
    try {
      console.log("Submitting form:", formData);
  
      const response = await registerTankerProvider(formData);
  
      if (response.success) {
        Alert.alert("Success", "Registration submitted successfully!");
        console.log("Form submitted:", response.data);
  
     
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          cnic: '',
          cnicExpiry: '',
          vehicleNumber: '',
          registrationNumber: '',
          capacity: '6000',
          vehicleModel: '',
          manufacturingYear: '',
          licenseNumber: '',
          licenseExpiry: '',
          licenseType: 'LTV',
          waterSource: '',
          sourceAddress: '',
          sourceType: 'municipal',
          waterQualityCertificate: false,
        });
        setStep(1);
      } else {
        Alert.alert(" Failed", response.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert(" Error", error.message || "Something went wrong!");
    }
  };

 

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📄</Text>
        </View>
        <Text style={styles.stepTitle}>Driver Information</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.fullName}
          onChangeText={(text) => handleInputChange('fullName', text)}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          placeholder="03XX-XXXXXXX"
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholder="your.email@example.com"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CNIC Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.cnic}
          onChangeText={(text) => handleInputChange('cnic', text)}
          placeholder="XXXXX-XXXXXXX-X"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CNIC Expiry Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.cnicExpiry}
          onChangeText={(text) => handleInputChange('cnicExpiry', text)}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🚚</Text>
        </View>
        <Text style={styles.stepTitle}>Vehicle Information</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Tanker Capacity *</Text>
        <View style={styles.capacityContainer}>
          {[
            { size: '6000', price: 'PKR 1,800', icon: '🚛' },
            { size: '12000', price: 'PKR 3,200', icon: '🚚' },
            { size: '15000', price: 'PKR 3,800', icon: '🚚' }
          ].map(option => (
            <TouchableOpacity
              key={option.size}
              style={[
                styles.capacityCard,
                formData.capacity === option.size && styles.capacityCardActive
              ]}
              onPress={() => handleInputChange('capacity', option.size)}
            >
              <Text style={styles.capacityIcon}>{option.icon}</Text>
              <Text style={[
                styles.capacitySize,
                formData.capacity === option.size && styles.capacitySizeActive
              ]}>
                {option.size}
              </Text>
              <Text style={[
                styles.capacityPrice,
                formData.capacity === option.size && styles.capacityPriceActive
              ]}>
                {option.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.vehicleNumber}
          onChangeText={(text) => handleInputChange('vehicleNumber', text)}
          placeholder="ABC-123"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Registration Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.registrationNumber}
          onChangeText={(text) => handleInputChange('registrationNumber', text)}
          placeholder="Enter registration number"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Vehicle Model *</Text>
        <TextInput
          style={styles.input}
          value={formData.vehicleModel}
          onChangeText={(text) => handleInputChange('vehicleModel', text)}
          placeholder="e.g., Hino 500"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Manufacturing Year *</Text>
        <TextInput
          style={styles.input}
          value={formData.manufacturingYear}
          onChangeText={(text) => handleInputChange('manufacturingYear', text)}
          placeholder="YYYY"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🪪</Text>
        </View>
        <Text style={styles.stepTitle}>License Information</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Driving License Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.licenseNumber}
          onChangeText={(text) => handleInputChange('licenseNumber', text)}
          placeholder="Enter license number"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Type *</Text>
        <View style={styles.radioContainer}>
          {['LTV', 'HTV', 'PSV'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.radioButton,
                formData.licenseType === type && styles.radioButtonActive
              ]}
              onPress={() => handleInputChange('licenseType', type)}
            >
              <Text style={[
                styles.radioText,
                formData.licenseType === type && styles.radioTextActive
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Expiry Date *</Text>
        <TextInput
          style={styles.input}
          value={formData.licenseExpiry}
          onChangeText={(text) => handleInputChange('licenseExpiry', text)}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Please ensure your license is valid and matches the vehicle category you're registering.
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>💧</Text>
        </View>
        <Text style={styles.stepTitle}>Water Source Details</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Water Source Type *</Text>
        <View style={styles.radioContainer}>
          {[
            { value: 'Municipal', label: 'Municipal' },
            { value: 'Boring', label: 'Boring' },
            { value: 'Filtration Plant', label: 'Filtration Plant' }
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioButton,
                formData.sourceType === option.value && styles.radioButtonActive
              ]}
              onPress={() => handleInputChange('sourceType', option.value)}
            >
              <Text style={[
                styles.radioText,
                formData.sourceType === option.value && styles.radioTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Water Source Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.waterSource}
          onChangeText={(text) => handleInputChange('waterSource', text)}
          placeholder="Enter water source name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Source Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.sourceAddress}
          onChangeText={(text) => handleInputChange('sourceAddress', text)}
          placeholder="Enter complete address of water source"
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => handleInputChange('waterQualityCertificate', !formData.waterQualityCertificate)}
      >
        <View style={[
          styles.checkbox,
          formData.waterQualityCertificate && styles.checkboxChecked
        ]}>
          {formData.waterQualityCertificate && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
        <Text style={styles.checkboxLabel}>
          I have a valid water quality certificate
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Water quality certificate will be verified during approval process.
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch(step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* Header */}
      

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        
        {step < 4 ? (
          <TouchableOpacity 
            style={[styles.nextButton, step === 1 && styles.nextButtonFull]} 
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.submitButton, step === 1 && styles.nextButtonFull]} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Registration →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
     marginTop:20,
    paddingHorizontal:20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    marginHorizontal:"auto"
  },
  headerSubtitle: {
    fontSize: 14,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal:"auto",
    paddingLeft: 40,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#1976D2',
  },
  stepCircleInactive: {
    backgroundColor: '#E0E0E0',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepNumberInactive: {
    color: '#757575',
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#1976D2',
  },
  stepLineInactive: {
    backgroundColor: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
    marginTop: 50,
  },
  stepContainer: {
    padding: 20,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  capacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  capacityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  capacityCardActive: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  capacityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  capacitySize: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  capacitySizeActive: {
    color: '#1976D2',
  },
  capacityPrice: {
    fontSize: 13,
    color: '#757575',
  },
  capacityPriceActive: {
    color: '#1976D2',
    fontWeight: '600',
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  radioButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  radioButtonActive: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  radioText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#757575',
  },
  radioTextActive: {
    color: '#1976D2',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#424242',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TankerProviderRegistration;