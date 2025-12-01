import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerTankerProvider } from "../../api/tankerProvider/register";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import { useUser } from '../../context/context';
import { useEffect } from 'react';

const TankerProviderRegistration = () => {
  const [step, setStep] = useState(1);
  const { user, clearUser } = useUser();
  const [isLoading, setisLoading]= useState(false);

  useEffect(() => {
    console.log("Navigated to Tanker Provider Registration");
  }, []);

  const [formData, setFormData] = useState({
    id:  '',
    TankerName: '',
    phone: '',
    email: '',
    password: '',
    vehicleNumber: '',
    registrationNumber: '',
    capacity: '6000',
    vehicleModel: '',
    manufacturingYear: '',
    // licenseNumber: '',
    // licenseExpiry: '',
    // licenseType: 'LTV',
    // waterSource: '',
    // sourceAddress: '',
    // sourceType: 'municipal',
    // waterQualityCertificate: false,
  });

  useEffect(() => {
    if (user?._id) {
      setFormData(prev => ({
        ...prev,
        id: user._id
      }));
    }
  }, [user]);

  useEffect(() => {
    console.log("Navigated to Tanker Provider Registration");
    console.log("User ID:", user?._id);
    console.log("Form Data ID:", formData.id);
  }, [user, formData.id]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const router = useRouter();

  const nextStep = () => {
    if (step === 1) {
      const { TankerName, phone, email, password} = formData;
      if (!TankerName || !phone || !email || !password) {
        Alert.alert("Missing Fields", "Please fill all driver information fields before continuing.");
        return;
      }
       const emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
       if (!emailRegex.test(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }
      // const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      
      
      // const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); 
      // if (!phoneRegex.test(cleanPhone)) {
      //   Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      //   return;
      // }
    }

    if (step === 2) {
      const { vehicleNumber, registrationNumber, vehicleModel, manufacturingYear, capacity } = formData;
      if (!vehicleNumber || !registrationNumber || !vehicleModel || !manufacturingYear || !capacity) {
        Alert.alert("Missing Fields", "Please fill all vehicle details before continuing.");
        return;
      }
    }

    // if (step === 3) {
    //   const { licenseNumber, licenseExpiry, licenseType } = formData;
    //   if (!licenseNumber || !licenseExpiry || !licenseType) {
    //     Alert.alert("Missing Fields", "Please complete all license details before continuing.");
    //     return;
    //   }
    // }

    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const storeTankerInfo = async (data) => {
    try {
      const tankerInfo = {
        id: data?._id,
        driverName: data?.fullName,
        driverPhone: data?.data?.phone,
        vehicleModel: data?.vehicleModel,
        vehicleNumber: data?.vehicleNumber
      };

      await AsyncStorage.setItem("tankerInfo", JSON.stringify(tankerInfo));
      console.log("Tanker info saved");
    } catch (error) {
      console.error(" Error saving tanker info:", error);
    }
  };

  const handleSubmit = async () => {

    if (isLoading) return;

    if (!formData.id) {
      Alert.alert("Error", "User ID is missing. Please try again.");
      return;
    }
    const {  vehicleNumber, registrationNumber, vehicleModel, manufacturingYear, capacity } = formData;
    if (!vehicleNumber || !registrationNumber || !vehicleModel || !manufacturingYear || !capacity) {
      Alert.alert("Missing Fields", "Please fill all  details before submitting.");
      return;
    }
    setisLoading(true);
    try {
      const response = await registerTankerProvider(formData);

      if (response.success) {
        Alert.alert("Success", "Registration submitted successfully!");
        storeTankerInfo(response.data);

        setFormData({
          id: user?._id || '',
          TankerName: '',
          phone: '',
          email: '',
          password: '',
          vehicleNumber: '',
          registrationNumber: '',
          capacity: '6000',
          vehicleModel: '',
          manufacturingYear: '',
          // licenseNumber: '',
          // licenseExpiry: '',
          // licenseType: 'LTV',
          // waterSource: '',
          // sourceAddress: '',
          // sourceType: 'municipal',
          // waterQualityCertificate: false,
        });
        router.push("/tabSupplier/homeScreen");
        setStep(1);
      } else {
        Alert.alert("Failed", response.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong!");
    }finally {
      setisLoading(false);
    }

  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}> Create Tanker ID</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tanker Name*</Text>
        <TextInput
          style={styles.input}
          value={formData.TankerName}
          onChangeText={(text) => handleInputChange('TankerName', text)}
          placeholder="Enter Tanker Name"
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
           maxLength={11}
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
  <Text style={styles.label}>Password</Text>
  <TextInput
    style={styles.input}
    value={formData.password} 
    onChangeText={(text) => handleInputChange('password', text)} 
    secureTextEntry={true} 
    placeholder="Enter your password"
    placeholderTextColor="#999"
  />
</View>

   
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.sectionTitle}>Vehicle Information</Text>

      <View style={styles.inputGroup}>
  <Text style={styles.label}>Select Tanker Capacity *</Text>
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.capacityScrollContainer}
  >
    <View style={styles.capacityContainer}>
      {[
        { size: '6000', price: 'PKR 1,800', icon: '🚛' },
        { size: '12000', price: 'PKR 3,200', icon: '🚚' },
        { size: '15000', price: 'PKR 3,800', icon: '🚚' },
        { size: '22000', price: 'PKR 5,200', icon: '🚚' }
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
  </ScrollView>
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
           keyboardType='phone-pad'  
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
          keyboardType='phone-pad'
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  // const renderStep3 = () => (
  //   <View style={styles.stepContainer}>
  //     <Text style={styles.sectionTitle}>License Information</Text>

  //     <View style={styles.inputGroup}>
  //       <Text style={styles.label}>Driving License Number *</Text>
  //       <TextInput
  //         style={styles.input}
  //         value={formData.licenseNumber}
  //         onChangeText={(text) => handleInputChange('licenseNumber', text)}
  //         placeholder="Enter license number"
  //         placeholderTextColor="#999"
  //       />
  //     </View>

  //     <View style={styles.inputGroup}>
  //       <Text style={styles.label}>License Type *</Text>
  //       <View style={styles.radioContainer}>
  //         {['LTV', 'HTV', 'PSV'].map(type => (
  //           <TouchableOpacity
  //             key={type}
  //             style={[
  //               styles.radioButton,
  //               formData.licenseType === type && styles.radioButtonActive
  //             ]}
  //             onPress={() => handleInputChange('licenseType', type)}
  //           >
  //             <Text style={[
  //               styles.radioText,
  //               formData.licenseType === type && styles.radioTextActive
  //             ]}>
  //               {type}
  //             </Text>
  //           </TouchableOpacity>
  //         ))}
  //       </View>
  //     </View>

  //     <View style={styles.inputGroup}>
  //       <Text style={styles.label}>License Expiry Date *</Text>
  //       <TextInput
  //         style={styles.input}
  //         value={formData.licenseExpiry}
  //         onChangeText={(text) => handleInputChange('licenseExpiry', text)}
  //         placeholder="DD/MM/YYYY"
  //         placeholderTextColor="#999"
  //       />
  //     </View>
  //   </View>
  // );

  // const renderStep3 = () => (
  //   <View style={styles.stepContainer}>
  //     <Text style={styles.sectionTitle}>Water Source Details</Text>

  //     <View style={styles.inputGroup}>
  //       <Text style={styles.label}>Water Source Type *</Text>
  //       <View style={styles.radioContainer}>
  //         {[
  //           { value: 'Municipal', label: 'Municipal' },
  //           { value: 'Boring', label: 'Boring' },
  //           { value: 'Filtration Plant', label: 'Filtration Plant' }
  //         ].map(option => (
  //           <TouchableOpacity
  //             key={option.value}
  //             style={[
  //               styles.radioButton,
  //               formData.sourceType === option.value && styles.radioButtonActive
  //             ]}
  //             onPress={() => handleInputChange('sourceType', option.value)}
  //           >
  //             <Text style={[
  //               styles.radioText,
  //               formData.sourceType === option.value && styles.radioTextActive
  //             ]}>
  //               {option.label}
  //             </Text>
  //           </TouchableOpacity>
  //         ))}
  //       </View>
  //     </View>

  //     <View style={styles.inputGroup}>
  //       <Text style={styles.label}>Water Source Name *</Text>
  //       <TextInput
  //         style={styles.input}
  //         value={formData.waterSource}
  //         onChangeText={(text) => handleInputChange('waterSource', text)}
  //         placeholder="Enter water source name"
  //         placeholderTextColor="#999"
  //       />
  //     </View>

  //     <View style={styles.inputGroup}>
  //       <Text style={styles.label}>Source Address *</Text>
  //       <TextInput
  //         style={[styles.input, styles.textArea]}
  //         value={formData.sourceAddress}
  //         onChangeText={(text) => handleInputChange('sourceAddress', text)}
  //         placeholder="Enter complete address of water source"
  //         multiline
  //         numberOfLines={3}
  //         placeholderTextColor="#999"
  //       />
  //     </View>

  //     <TouchableOpacity
  //       style={styles.checkboxContainer}
  //       onPress={() => handleInputChange('waterQualityCertificate', !formData.waterQualityCertificate)}
  //     >
  //       <View style={[
  //         styles.checkbox,
  //         formData.waterQualityCertificate && styles.checkboxChecked
  //       ]}>
  //         {formData.waterQualityCertificate && (
  //           <Text style={styles.checkmark}>✓</Text>
  //         )}
  //       </View>
  //       <Text style={styles.checkboxLabel}>
  //         I have a valid water quality certificate
  //       </Text>
  //     </TouchableOpacity>
  //   </View>
  // );

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
     
     
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container} >
    
      
 
    <View style={styles.header}>
    
    <TouchableOpacity  onPress={()=> router.back()} style={styles.iconButton}>
      <Ionicons name="arrow-back-outline" size={24} color="#fff" />
    </TouchableOpacity>
    <View style={styles.headerContent}>
      <Text style={styles.title}>Tanker Registeration</Text>

    </View>
  </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderStepContent()}
            
          
            <View style={styles.buttonContainer}>
              {step > 1 && (
                <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {step < 2 ? (
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.submitButton, 
                    isLoading && styles.submitButtonLoading
                  ]} 
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.submitButtonText}>Submitting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Registration</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1976D2',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
 
  headerContent: {
    flex: 1,
      marginLeft:50
  },
  scrollContent: {},
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  stepIndicator: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  stepContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  capacityScrollContainer: {
    paddingHorizontal: 5,
  },
  capacityContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 5,
  },
  capacityCard: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    minWidth: 95,
  },
  capacityCardActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  capacityIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  capacitySize: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  capacitySizeActive: {
    color: '#1976d2',
  },
  capacityPrice: {
    fontSize: 12,
    color: '#6c757d',
  },
  capacityPriceActive: {
    color: '#1976d2',
    fontWeight: '600',
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  radioText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  radioTextActive: {
    color: '#007bff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default TankerProviderRegistration;