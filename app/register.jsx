import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../components/Input';
import Button from '../components/Button';
import { Auth } from '../api/Auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from '../context/context';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const { signup, login } = Auth();
  const { updateUser } = useUser();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }


    const emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
       if (!emailRegex.test(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address.");
        return;
      }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }
    

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const result = await signup(name, email, password, role);
    console.log("Signup result:", result);


    if (result.success) {
      await new Promise((r) => setTimeout(r, 500));
      const result = await login(email, password);
      console.log("Login after signup result:", result);

      if (result.success) {

        const { user, accessToken, refreshToken } = result.data;


        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);
        console.log("Registered User:", user);

        console.log("Registered User:", user);
        await updateUser(user);

        if (user.role === "customer") {
          router.replace("/tabCustomer/home");
        }
        else {
          router.replace("/tabSupplier/homeScreen")
        }
      }

    } else {
      Alert.alert("Signup Failed", result.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Create your Account</Text>
        <Text style={styles.subtitle}>
          Please fill in your details to create your account
        </Text>

        <View style={styles.form}>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Beautiful Experience"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Productdesignernew@gmail.com"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            secureTextEntry
          />
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••••••"
            secureTextEntry
          />

     
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>Select Role</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setRole('customer')}
              >
                <View
                  style={[
                    styles.radioCircle,
                    role === 'customer' && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Customer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setRole('Supplier')}
              >
                <View
                  style={[
                    styles.radioCircle,
                    role === 'Supplier' && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioText}>Supplier</Text>
              </TouchableOpacity>
             
            </View>
          </View>

          <Button
            title="CREATE AN ACCOUNT"
            onPress={handleRegister}
            variant="primary"
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  backButton: {
    fontSize: 28,
    color: '#4FC3F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4FC3F7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#4FC3F7',
    fontSize: 14,
    fontWeight: '600',
  },


  roleContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4FC3F7',
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4FC3F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#4FC3F7',
  },
  radioText: {
    fontSize: 15,
    color: '#333',
  },
});
