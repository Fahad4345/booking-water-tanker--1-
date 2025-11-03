import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/Input';
import Button from '../components/Button';

import { Auth } from '../api/Auth';
import { useUser } from '../context/context';

export default function EditProfileScreen() {
  const { updateProfile } = Auth();
  const router = useRouter();
  const { user: contextUser, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {

      if (contextUser) {
        console.log("Context User", contextUser);
        setUser({
          id: contextUser._id || '',
          name: contextUser.name || '',
          email: contextUser.email || '',
          phone: contextUser.phone || '',
          address: contextUser.addresse || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const result = await updateProfile({
        id: user.id,
        name: user.name,
        phone: user.phone,
        addresse: user.address,
      });
      if (result.success) {

        const updatedUser = {
          ...contextUser,
          name: user.name,
          phone: user.phone,
          address: user.address,
        };
        await updateUser(updatedUser);

        Alert.alert("Success", "Profile updated!");
        console.log("User", user);
        router.back();
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        { text: "Keep Editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />



      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.formSection}>
          <Input
            label="Full Name"
            value={user.name}
            onChangeText={(text) => setUser({ ...user, name: text })}
            placeholder="Enter your full name"
          />

          <Input
            label="Email Address"
            editable={false}
            value={user.email}
            onChangeText={(text) => setUser({ ...user, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <Input
            label="Phone Number"
            value={user.phone}
            onChangeText={(text) => setUser({ ...user, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Input
            label="Address"
            value={user.address}
            onChangeText={(text) => setUser({ ...user, address: text })}
            placeholder="Enter your address"
            multiline={true}
            style={styles.textArea}
          />
        </View>


        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            variant="primary"
            style={styles.saveButton}
            disabled={loading}
          />


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    padding: 20,
    marginTop: 30,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 3,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 50,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  changePhotoText: {
    color: '#4FC3F7',
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    elevation: 3,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
